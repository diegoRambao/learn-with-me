import { describe, expect, it } from 'vitest';
import { createOrderDraft, moveNoteToTopic, moveOrderItem, orderPayload, reorderOrderDraft } from '../../../admin/src/lib/client/order-draft';

const category = {
  id: 'dart', name: 'Dart', description: 'Lenguaje', image: '/images/categories/dart.svg', level: 'beginner' as const,
  topics: [
    { id: 'fundamentos', name: 'Fundamentos', position: 1, categoryId: 'dart' },
    { id: 'avanzado', name: 'Avanzado', position: 4, categoryId: 'dart' },
  ],
  sourcePath: 'src/content/categories/dart.json', revision: 'category-revision',
};
const notes = [
  { id: 'intro', folder: 'dart', title: 'Intro', description: 'x', tags: ['dart'], category: 'dart', topic: 'fundamentos', durationMinutes: 1, position: 2, format: 'written' as const, body: '# x', managedAssets: [], sourcePath: 'src/content/notes/dart/intro.md', revision: 'intro-revision', status: 'active' as const },
  { id: 'types', folder: 'legacy', title: 'Types', description: 'x', tags: ['dart'], category: 'dart', durationMinutes: 1, position: 3, format: 'written' as const, body: '# x', managedAssets: [], sourcePath: 'src/content/notes/legacy/types.md', revision: 'types-revision', status: 'active' as const },
];

describe('order draft', () => {
  it('contains every topic and active note exactly once with all base revisions', () => {
    const draft = createOrderDraft(category, notes);
    expect(draft.items.map(({ kind, id }) => `${kind}:${id}`)).toEqual(['topic:fundamentos', 'note:intro', 'note:types', 'topic:avanzado']);
    expect(draft.baseRevisions).toEqual({
      'src/content/categories/dart.json': 'category-revision',
      'src/content/notes/dart/intro.md': 'intro-revision',
      'src/content/notes/legacy/types.md': 'types-revision',
    });
  });

  it('moves adjacent items, renumbers 1..N, and retains the moved identity for focus', () => {
    const result = moveOrderItem(createOrderDraft(category, notes), 'note', 'types', 'up');
    expect(result.moved).toBe(true);
    expect(result.focusId).toBe('note:types');
    expect(result.draft.items.map(({ id, position }) => [id, position])).toEqual([
      ['fundamentos', 1], ['types', 2], ['intro', 3], ['avanzado', 4],
    ]);
    expect(moveOrderItem(result.draft, 'topic', 'fundamentos', 'up').moved).toBe(false);
  });

  it('serializes the exact global sequence for a multi-file commit', () => {
    const payload = orderPayload(createOrderDraft(category, notes));
    expect(payload.items).toEqual([
      { kind: 'topic', id: 'fundamentos' },
      { kind: 'note', id: 'intro', folder: 'dart', topic: 'fundamentos' },
      { kind: 'note', id: 'types', folder: 'legacy', topic: null },
      { kind: 'topic', id: 'avanzado' },
    ]);
  });

  it('reassigns a note to another topic while preserving exact membership', () => {
    const original = createOrderDraft(category, notes);
    const reassigned = moveNoteToTopic(original, 'types', 'avanzado', original.items.length);
    expect(reassigned.items.find((item) => item.kind === 'note' && item.id === 'types')).toMatchObject({ topic: 'avanzado' });
    expect(reassigned.items.map(({ position }) => position)).toEqual([1, 2, 3, 4]);
    expect(moveNoteToTopic(original, 'types', 'missing', 0)).toBe(original);
  });

  it('rejects reordered drafts with missing or duplicated items', () => {
    const original = createOrderDraft(category, notes);
    expect(reorderOrderDraft(original, original.items.slice(1))).toBe(original);
    expect(reorderOrderDraft(original, [...original.items, original.items[0]])).toBe(original);
  });
});
