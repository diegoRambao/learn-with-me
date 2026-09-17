import { readFile } from 'node:fs/promises';
import type { OrderItem } from '../contracts';
import { serializeCategoryDocument, serializeNoteDocument } from './content-serialization';
import { loadContentRepository } from './content-repository';
import { commitFileTransaction, TransactionConflictError, type FileOperation } from './file-transaction';
import { HttpError } from './http-guard';
import { createRepositoryPaths, categoryFilePath, noteFilePath } from './safe-paths';

export type OrderMutationInput = Readonly<{
  items: ReadonlyArray<Readonly<
    { kind: 'topic'; id: string }
    | { kind: 'note'; id: string; folder: string; topic: string | null }
  >>;
  baseRevisions: Readonly<Record<string, string>>;
}>;

const itemKey = (item: Readonly<{ kind: string; id: string; folder?: string }>): string =>
  item.kind === 'note' ? `note:${item.folder}:${item.id}` : `topic:${item.id}`;

export const saveCategoryOrder = async (
  repositoryRoot: string,
  categoryId: string,
  input: OrderMutationInput,
): Promise<Readonly<{ items: ReadonlyArray<OrderItem>; changedPaths: ReadonlyArray<string> }>> => {
  const snapshot = await loadContentRepository(repositoryRoot);
  const category = snapshot.categories.find(({ id }) => id === categoryId);
  if (!category) throw new HttpError(404, 'category_not_found', 'La categoría ya no existe.');
  const notes = snapshot.notes.filter(({ category: noteCategory }) => noteCategory === categoryId);
  const expected = [
    ...category.topics.map((topic) => itemKey({ kind: 'topic', id: topic.id })),
    ...notes.map((note) => itemKey({ kind: 'note', folder: note.folder, id: note.id })),
  ].sort();
  const received = input.items.map(itemKey).sort();
  if (new Set(received).size !== received.length || JSON.stringify(expected) !== JSON.stringify(received)) {
    throw new HttpError(409, 'order_membership_changed', 'Recarga el orden: la categoría cambió desde que abriste el borrador.');
  }
  const requiredRevisions = Object.fromEntries([[category.sourcePath, category.revision], ...notes.map((note) => [note.sourcePath, note.revision])]);
  if (Object.keys(requiredRevisions).some((path) => input.baseRevisions[path] !== requiredRevisions[path])) {
    throw new HttpError(409, 'stale_revision', 'Recarga el orden: uno de sus archivos cambió.');
  }

  const topicIds = new Set(category.topics.map(({ id }) => id));
  const invalidTopic = input.items.find((item) => item.kind === 'note' && item.topic !== null && !topicIds.has(item.topic));
  if (invalidTopic) throw new HttpError(409, 'unknown_topic', 'El tema de destino ya no existe. Recarga la estructura antes de guardar.');

  const positionByKey = new Map(input.items.map((item, index) => [itemKey(item), index + 1]));
  const updatedTopics = category.topics.map((topic) => ({
    id: topic.id,
    name: topic.name,
    position: positionByKey.get(itemKey({ kind: 'topic', id: topic.id })) as number,
  }));
  const paths = createRepositoryPaths(repositoryRoot);
  const categoryOriginal = await readFile(categoryFilePath(paths, categoryId), 'utf8');
  const operations: FileOperation[] = [{
    type: 'write',
    path: category.sourcePath,
    contents: serializeCategoryDocument(categoryOriginal, { topics: updatedTopics }),
  }];
  const changedPaths = [category.sourcePath];
  for (const note of notes) {
    const position = positionByKey.get(itemKey({ kind: 'note', folder: note.folder, id: note.id })) as number;
    const orderedNote = input.items.find((item) => item.kind === 'note' && item.id === note.id && item.folder === note.folder);
    const topic = orderedNote?.kind === 'note' ? orderedNote.topic ?? undefined : note.topic;
    if (position === note.position && topic === note.topic) continue;
    const original = await readFile(noteFilePath(paths, note.folder, note.id), 'utf8');
    operations.push({
      type: 'write',
      path: note.sourcePath,
      contents: serializeNoteDocument(original, { position, topic: topic ?? '' }, note.body),
    });
    changedPaths.push(note.sourcePath);
  }
  try {
    await commitFileTransaction({ repositoryRoot, operations, expectedRevisions: input.baseRevisions });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  const items: OrderItem[] = input.items.map((item, index) => {
    if (item.kind === 'topic') return { ...item, position: index + 1, label: category.topics.find(({ id }) => id === item.id)?.name ?? item.id };
    return { ...item, position: index + 1, label: notes.find(({ id, folder }) => id === item.id && folder === item.folder)?.title ?? item.id };
  });
  return { items, changedPaths };
};
