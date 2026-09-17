import { randomUUID } from 'node:crypto';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import type { ContentSnapshot, NoteDocument, TrashSummary } from '../contracts';
import { serializeCategoryDocument, serializeNoteDocument } from './content-serialization';
import { loadContentRepository } from './content-repository';
import { commitFileTransaction, TransactionConflictError, type FileOperation } from './file-transaction';
import { HttpError } from './http-guard';
import { sha256 } from './revisions';
import { assertSlug, categoryFilePath, createRepositoryPaths, noteFilePath, resolveContainedPath } from './safe-paths';

type TrashAsset = Readonly<{ originalPath: string; copyPath: string; sha256: string }>;
type TrashManifest = Readonly<{
  trashId: string;
  title: string;
  category: string;
  originalPath: string;
  originalRevision: string;
  originalPosition: number;
  deletedAt: string;
  assetCopies: ReadonlyArray<TrashAsset>;
}>;

const portable = (value: string): string => value.replaceAll(sep, '/');
const exists = async (path: string): Promise<boolean> => { try { await access(path); return true; } catch { return false; } };
const manifestPath = (trashId: string): string => `.content-admin/trash/notes/${trashId}/manifest.json`;
const noteCopyPath = (trashId: string): string => `.content-admin/trash/notes/${trashId}/note.md`;

const readManifest = async (repositoryRoot: string, trashId: string): Promise<Readonly<{ manifest: TrashManifest; bytes: Uint8Array; revision: string }>> => {
  if (!/^[a-f0-9-]{36}$/i.test(trashId)) throw new HttpError(404, 'trash_not_found', 'La entrada de papelera ya no existe.');
  try {
    const bytes = await readFile(join(repositoryRoot, manifestPath(trashId)));
    const manifest = JSON.parse(bytes.toString('utf8')) as TrashManifest;
    if (manifest.trashId !== trashId) throw new Error('trash id mismatch');
    return { manifest, bytes, revision: sha256(bytes) };
  } catch {
    throw new HttpError(404, 'trash_not_found', 'La entrada de papelera ya no existe.');
  }
};

const orderAfterRemoval = async (
  repositoryRoot: string,
  snapshot: ContentSnapshot,
  removed: NoteDocument,
): Promise<Readonly<{ operations: FileOperation[]; expected: Record<string, string> }>> => {
  const category = snapshot.categories.find(({ id }) => id === removed.category);
  if (!category) return { operations: [], expected: {} };
  const activeNotes = snapshot.notes.filter((note) => note.category === removed.category && note.sourcePath !== removed.sourcePath);
  const sequence = [
    ...category.topics.map((topic) => ({ kind: 'topic' as const, id: topic.id, position: topic.position })),
    ...activeNotes.map((note) => ({ kind: 'note' as const, id: note.id, position: note.position, note })),
  ].sort((left, right) => left.position - right.position || left.id.localeCompare(right.id));
  const positionByKey = new Map(sequence.map((item, index) => [`${item.kind}:${item.id}`, index + 1]));
  const paths = createRepositoryPaths(repositoryRoot);
  const operations: FileOperation[] = [];
  const expected: Record<string, string> = {};
  const topics = category.topics.map((topic) => ({ ...topic, position: positionByKey.get(`topic:${topic.id}`) as number }));
  if (topics.some((topic, index) => topic.position !== category.topics[index].position)) {
    operations.push({ type: 'write', path: category.sourcePath, contents: serializeCategoryDocument(await readFile(categoryFilePath(paths, category.id), 'utf8'), { topics }) });
    expected[category.sourcePath] = category.revision;
  }
  for (const note of activeNotes) {
    const position = positionByKey.get(`note:${note.id}`) as number;
    if (position === note.position) continue;
    operations.push({ type: 'write', path: note.sourcePath, contents: serializeNoteDocument(await readFile(noteFilePath(paths, note.folder, note.id), 'utf8'), { position }, note.body) });
    expected[note.sourcePath] = note.revision;
  }
  return { operations, expected };
};

export const moveNoteToTrash = async (
  repositoryRoot: string,
  folder: string,
  noteId: string,
  revision: string,
): Promise<TrashSummary> => {
  assertSlug(folder, 'La carpeta'); assertSlug(noteId, 'El ID de nota');
  const snapshot = await loadContentRepository(repositoryRoot);
  const note = snapshot.notes.find((entry) => entry.folder === folder && entry.id === noteId);
  if (!note) throw new HttpError(404, 'note_not_found', 'La nota ya no existe.');
  const originalPath = note.sourcePath;
  const originalBytes = await readFile(join(repositoryRoot, originalPath));
  const trashId = randomUUID();
  const assetCopies: TrashAsset[] = [];
  const operations: FileOperation[] = [{ type: 'write', path: noteCopyPath(trashId), contents: originalBytes }];
  if (note.format === 'written') {
    for (const reference of note.managedAssets) {
      const originalAssetPath = portable(join(dirname(originalPath), reference));
      const absoluteAsset = resolveContainedPath(createRepositoryPaths(repositoryRoot).notesRoot, portable(relative(createRepositoryPaths(repositoryRoot).notesRoot, join(repositoryRoot, originalAssetPath))));
      if (!await exists(absoluteAsset)) continue;
      const bytes = await readFile(absoluteAsset);
      const copyPath = `.content-admin/trash/notes/${trashId}/${reference}`;
      assetCopies.push({ originalPath: originalAssetPath, copyPath, sha256: sha256(bytes) });
      operations.push({ type: 'write', path: copyPath, contents: bytes });
    }
  }
  const manifest: TrashManifest = {
    trashId,
    title: note.title,
    category: note.category,
    originalPath,
    originalRevision: note.revision,
    originalPosition: note.position,
    deletedAt: new Date().toISOString(),
    assetCopies,
  };
  const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`;
  operations.push({ type: 'write', path: manifestPath(trashId), contents: manifestBytes });
  const reordered = await orderAfterRemoval(repositoryRoot, snapshot, note);
  operations.push(...reordered.operations, { type: 'delete', path: originalPath });
  try {
    await commitFileTransaction({ repositoryRoot, operations, expectedRevisions: { [originalPath]: revision, ...reordered.expected } });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return { trashId, title: note.title, category: note.category, originalPath, deletedAt: manifest.deletedAt, manifestRevision: sha256(manifestBytes), canRestore: true };
};

export const listTrashEntries = async (repositoryRoot: string): Promise<ReadonlyArray<TrashSummary>> => {
  const directory = join(createRepositoryPaths(repositoryRoot).trashRoot, 'notes');
  let ids: ReadonlyArray<string> = [];
  try { ids = await readdir(directory); } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
  const entries = await Promise.all(ids.map(async (trashId): Promise<TrashSummary | null> => {
    try {
      const { manifest, revision } = await readManifest(repositoryRoot, trashId);
      return { trashId, title: manifest.title, category: manifest.category, originalPath: manifest.originalPath, deletedAt: manifest.deletedAt, manifestRevision: revision, canRestore: !await exists(join(repositoryRoot, manifest.originalPath)) };
    } catch { return null; }
  }));
  return entries.filter((entry): entry is TrashSummary => Boolean(entry)).sort((left, right) => right.deletedAt.localeCompare(left.deletedAt));
};

export const restoreTrashEntry = async (repositoryRoot: string, trashId: string, expectedRevision: string): Promise<ReadonlyArray<string>> => {
  const { manifest, revision } = await readManifest(repositoryRoot, trashId);
  if (revision !== expectedRevision) throw new HttpError(409, 'stale_revision', 'La entrada de papelera cambió. Recárgala antes de restaurar.');
  const destination = join(repositoryRoot, manifest.originalPath);
  if (await exists(destination)) throw new HttpError(409, 'restore_destination_conflict', `Ya existe ${manifest.originalPath}; la papelera se conserva.`);
  const noteBytes = await readFile(join(repositoryRoot, noteCopyPath(trashId)));
  const operations: FileOperation[] = [{ type: 'write', path: manifest.originalPath, contents: noteBytes }];
  const expected: Record<string, string | null> = { [manifest.originalPath]: null, [manifestPath(trashId)]: revision };
  const changedPaths = [manifest.originalPath];
  for (const asset of manifest.assetCopies) {
    const activePath = join(repositoryRoot, asset.originalPath);
    const copyBytes = await readFile(join(repositoryRoot, asset.copyPath));
    if (await exists(activePath)) {
      if (sha256(await readFile(activePath)) !== asset.sha256) throw new HttpError(409, 'restore_asset_conflict', `El recurso ${asset.originalPath} tiene bytes distintos.`);
      continue;
    }
    operations.push({ type: 'write', path: asset.originalPath, contents: copyBytes });
    expected[asset.originalPath] = null;
    changedPaths.push(asset.originalPath);
  }
  const snapshot = await loadContentRepository(repositoryRoot);
  const category = snapshot.categories.find(({ id }) => id === manifest.category);
  if (!category) throw new HttpError(409, 'restore_category_missing', 'Crea o restaura la categoría antes de restaurar esta nota.');
  const paths = createRepositoryPaths(repositoryRoot);
  const topicUpdates = category.topics.map((topic) => topic.position >= manifest.originalPosition ? { ...topic, position: topic.position + 1 } : topic);
  if (topicUpdates.some((topic, index) => topic.position !== category.topics[index].position)) {
    operations.push({ type: 'write', path: category.sourcePath, contents: serializeCategoryDocument(await readFile(categoryFilePath(paths, category.id), 'utf8'), { topics: topicUpdates }) });
    expected[category.sourcePath] = category.revision;
    changedPaths.push(category.sourcePath);
  }
  for (const note of snapshot.notes.filter((entry) => entry.category === manifest.category && entry.position >= manifest.originalPosition)) {
    operations.push({ type: 'write', path: note.sourcePath, contents: serializeNoteDocument(await readFile(noteFilePath(paths, note.folder, note.id), 'utf8'), { position: note.position + 1 }, note.body) });
    expected[note.sourcePath] = note.revision;
    changedPaths.push(note.sourcePath);
  }
  operations.push({ type: 'delete', path: `.content-admin/trash/notes/${trashId}` });
  try { await commitFileTransaction({ repositoryRoot, operations, expectedRevisions: expected }); }
  catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return changedPaths;
};

export const purgeTrashEntry = async (repositoryRoot: string, trashId: string, expectedRevision: string, confirmation: string): Promise<void> => {
  if (confirmation !== trashId) throw new HttpError(400, 'confirmation_mismatch', 'Escribe el ID exacto de la entrada para eliminarla definitivamente.');
  const { revision } = await readManifest(repositoryRoot, trashId);
  if (revision !== expectedRevision) throw new HttpError(409, 'stale_revision', 'La entrada de papelera cambió. Recárgala antes de eliminarla.');
  try {
    await commitFileTransaction({ repositoryRoot, operations: [{ type: 'delete', path: `.content-admin/trash/notes/${trashId}` }], expectedRevisions: { [manifestPath(trashId)]: revision } });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
};
