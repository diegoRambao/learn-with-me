import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import NoteNavigation from '../../src/components/NoteNavigation.astro';
import type { Note } from '../../src/lib/content';

const category = { id: 'dart', name: 'Dart', description: 'Lenguaje de programación', image: '/dart.svg', level: 'beginner' as const };
const previousNote = { id: 'dart-types', title: 'Tipos que explican la intención', description: '', tags: ['dart'], category: 'dart', durationMinutes: 10, position: 1, format: 'written' as const, body: '' };
const nextNote = { id: 'dart-video', title: 'Dart en una sesión práctica', description: '', tags: ['dart'], category: 'dart', durationMinutes: 15, position: 2, format: 'video' as const, youtubeVideoId: 'M7lc1UVf-VE', body: '' };

const renderNavigation = async (previous: Note | null = previousNote, next: Note | null = nextNote): Promise<string> => {
  const container = await AstroContainer.create();
  return container.renderToString(NoteNavigation, { props: { category, previousNote: previous, nextNote: next } });
};

describe('NoteNavigation', () => {
  it('omits the landmark when no destinations exist', async () => {
    await expect(renderNavigation(null, null)).resolves.not.toContain('<nav');
  });

  it('renders only the available destination', async () => {
    const previousOnly = await renderNavigation(previousNote, null);
    expect(previousOnly).toContain('Anterior');
    expect(previousOnly).not.toContain('Siguiente');
    expect(previousOnly).toContain('/categorias/dart/dart-types/');

    const nextOnly = await renderNavigation(null, nextNote);
    expect(nextOnly).toContain('Siguiente');
    expect(nextOnly).not.toContain('Anterior');
    expect(nextOnly).toContain('/categorias/dart/dart-video/');
  });

  it('orders complete labels from Anterior to Siguiente', async () => {
    const html = await renderNavigation();
    expect(html).toContain('aria-label="Navegación entre notas"');
    expect(html.indexOf('Anterior')).toBeLessThan(html.indexOf('Siguiente'));
    expect(html).toContain(previousNote.title);
    expect(html).toContain(nextNote.title);
  });
});
