import { describe, expect, it } from 'vitest';
import { applyMarkdownCommand } from '../../../admin/src/lib/client/markdown-toolbar';
import { changeNoteFormat, createNoteDraft, updateNoteDraft, validateNoteDraft } from '../../../admin/src/lib/client/note-draft';

const categories = [{
  id: 'dart',
  name: 'Dart',
  description: 'Lenguaje',
  image: '/images/categories/dart.svg',
  level: 'beginner' as const,
  topics: [{ id: 'fundamentos', name: 'Fundamentos', position: 1, categoryId: 'dart' }],
  sourcePath: 'src/content/categories/dart.json',
  revision: 'revision',
}];

describe('note editing draft', () => {
  it('tracks dirty values without mutating the loaded draft', () => {
    const original = createNoteDraft({ title: 'Original', format: 'written', body: '# Texto' });
    const updated = updateNoteDraft(original, { title: 'Nuevo' });
    expect(original.values.title).toBe('Original');
    expect(updated.values.title).toBe('Nuevo');
    expect(updated.dirty).toBe(true);
  });

  it('associates actionable issues with invalid note fields', () => {
    const draft = createNoteDraft({
      id: 'nota', title: '', description: '', tags: [], category: 'dart', topic: 'missing',
      durationMinutes: 0, position: 0, format: 'written', body: '',
    });
    const validated = validateNoteDraft(draft, categories);
    expect(Object.keys(validated.fieldIssues)).toEqual(expect.arrayContaining(['title', 'description', 'tags', 'topic', 'durationMinutes', 'position', 'body']));
  });

  it('requires confirmation before discarding body or video data', () => {
    const written = createNoteDraft({ format: 'written', body: '# Importante', youtubeVideoId: '' });
    expect(changeNoteFormat(written, 'video', false)).toMatchObject({ changed: false, requiresConfirmation: true });
    const changed = changeNoteFormat(written, 'video', true);
    expect(changed.changed).toBe(true);
    expect(changed.draft.values).toMatchObject({ format: 'video', body: '' });
  });
});

describe('markdown toolbar', () => {
  it('wraps a selection and preserves a useful selection range', () => {
    const result = applyMarkdownCommand('Texto seleccionado', 0, 5, 'bold');
    expect(result.value).toBe('**Texto** seleccionado');
    expect(result.value.slice(result.selectionStart, result.selectionEnd)).toBe('Texto');
  });

  it('supports headings, lists, links, code, images, and video links', () => {
    expect(applyMarkdownCommand('Título', 0, 6, 'heading').value).toBe('## Título');
    expect(applyMarkdownCommand('uno\ndos', 0, 7, 'unordered-list').value).toBe('- uno\n- dos');
    expect(applyMarkdownCommand('sitio', 0, 5, 'link', 'https://example.com').value).toContain('(https://example.com)');
    expect(applyMarkdownCommand('code', 0, 4, 'code-block').value).toContain('```');
    expect(applyMarkdownCommand('Alt', 0, 3, 'image', 'assets/diagram.png').value).toBe('![Alt](assets/diagram.png)');
    expect(applyMarkdownCommand('', 0, 0, 'video', 'https://youtu.be/M7lc1UVf-VE').value).toContain('youtu.be');
  });
});
