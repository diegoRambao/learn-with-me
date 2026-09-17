import type { CategoryDocument, NoteDocument, OrderDraft, OrderItem } from '../contracts';

export const createOrderDraft = (
  category: CategoryDocument,
  notes: ReadonlyArray<NoteDocument>,
): OrderDraft => {
  const items: OrderItem[] = [
    ...category.topics.map((topic) => ({ kind: 'topic' as const, id: topic.id, position: topic.position, label: topic.name })),
    ...notes.filter(({ category: categoryId }) => categoryId === category.id).map((note) => ({
      kind: 'note' as const,
      id: note.id,
      folder: note.folder,
      topic: note.topic ?? null,
      position: note.position,
      label: note.title,
    })),
  ].sort((left, right) => left.position - right.position || left.id.localeCompare(right.id));
  return {
    categoryId: category.id,
    items: items.map((item, index) => ({ ...item, position: index + 1 })),
    baseRevisions: Object.fromEntries([
      [category.sourcePath, category.revision],
      ...notes.filter(({ category: categoryId }) => categoryId === category.id).map((note) => [note.sourcePath, note.revision]),
    ]),
  };
};

export const moveOrderItem = (
  draft: OrderDraft,
  kind: OrderItem['kind'],
  id: string,
  direction: 'up' | 'down',
): Readonly<{ draft: OrderDraft; moved: boolean; focusId: string }> => {
  const index = draft.items.findIndex((item) => item.kind === kind && item.id === id);
  const destination = direction === 'up' ? index - 1 : index + 1;
  const focusId = `${kind}:${id}`;
  if (index < 0 || destination < 0 || destination >= draft.items.length) return { draft, moved: false, focusId };
  const items = [...draft.items];
  [items[index], items[destination]] = [items[destination], items[index]];
  return {
    draft: { ...draft, items: items.map((item, itemIndex) => ({ ...item, position: itemIndex + 1 })) },
    moved: true,
    focusId,
  };
};

export const orderPayload = (draft: OrderDraft): Readonly<{
  items: ReadonlyArray<Readonly<{ kind: 'topic'; id: string } | { kind: 'note'; id: string; folder: string; topic: string | null }>>;
  baseRevisions: Readonly<Record<string, string>>;
}> => ({
  items: draft.items.map((item) => item.kind === 'topic'
    ? { kind: 'topic', id: item.id }
    : { kind: 'note', id: item.id, folder: item.folder, topic: item.topic }),
  baseRevisions: draft.baseRevisions,
});

export const reorderOrderDraft = (
  draft: OrderDraft,
  orderedItems: ReadonlyArray<OrderItem>,
): OrderDraft => {
  const currentKeys = draft.items.map(orderItemKey).sort();
  const proposedKeys = orderedItems.map(orderItemKey).sort();
  if (new Set(proposedKeys).size !== proposedKeys.length || currentKeys.join('|') !== proposedKeys.join('|')) return draft;
  return {
    ...draft,
    items: orderedItems.map((item, index) => ({ ...item, position: index + 1 })),
  };
};

export const moveNoteToTopic = (
  draft: OrderDraft,
  noteId: string,
  topic: string | null,
  destinationIndex: number,
): OrderDraft => {
  const note = draft.items.find((item): item is Extract<OrderItem, { kind: 'note' }> => item.kind === 'note' && item.id === noteId);
  if (!note || (topic && !draft.items.some((item) => item.kind === 'topic' && item.id === topic))) return draft;
  const remaining = draft.items.filter((item) => item !== note);
  const safeIndex = Math.max(0, Math.min(destinationIndex, remaining.length));
  remaining.splice(safeIndex, 0, { ...note, topic });
  return reorderOrderDraft(draft, remaining);
};

export const orderItemKey = (item: OrderItem): string => item.kind === 'topic'
  ? `topic:${item.id}`
  : `note:${item.folder}:${item.id}`;
