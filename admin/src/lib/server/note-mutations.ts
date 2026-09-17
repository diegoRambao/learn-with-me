import { access, readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { siteConfig } from '../../../../src/data/site';
import { validateContent, type CategoryInput, type NoteInput } from '../../../../src/lib/validation';
import type { ContentSnapshot, NoteDocument, NoteMutationInput } from '../contracts';
import { serializeNoteDocument } from './content-serialization';
import { loadContentRepository } from './content-repository';
import { commitFileTransaction, TransactionConflictError, type FileOperation } from './file-transaction';
import { HttpError } from './http-guard';
import { sha256 } from './revisions';
import { assertNoSymlinkPath, assertSlug, createRepositoryPaths, noteAssetPath, noteFilePath } from './safe-paths';
import { loadStagedUpload } from './uploads';

const portable = (value: string): string => value.replaceAll(sep, '/');
const fileExists = async (path: string): Promise<boolean> => {
  try { await access(path); return true; } catch { return false; }
};

const categoryInputs = (snapshot: ContentSnapshot): ReadonlyArray<CategoryInput> => snapshot.categories.map((category) => ({
  sourcePath: category.sourcePath,
  id: category.id,
  name: category.name,
  description: category.description,
  image: category.image,
  level: category.level,
  topics: category.topics,
}));

const noteInput = (note: NoteDocument): NoteInput => ({
  sourcePath: note.sourcePath,
  folder: note.folder,
  depth: 2,
  id: note.id,
  title: note.title,
  description: note.description,
  tags: note.tags,
  category: note.category,
  topic: note.topic,
  durationMinutes: note.durationMinutes,
  position: note.position,
  format: note.format,
  body: note.body,
  youtubeVideoId: note.format === 'video' ? note.youtubeVideoId : undefined,
});

const inputToDocument = (input: NoteMutationInput, folder: string, sourcePath: string, revision = ''): NoteDocument => {
  const common = {
    id: input.id,
    folder,
    title: input.title,
    description: input.description,
    tags: input.tags,
    category: input.category,
    ...(input.topic ? { topic: input.topic } : {}),
    durationMinutes: input.durationMinutes,
    position: input.position,
    sourcePath,
    revision,
    status: 'active' as const,
  };
  return input.format === 'video'
    ? { ...common, format: 'video', body: '', youtubeVideoId: input.youtubeVideoId ?? '' }
    : { ...common, format: 'written', body: input.body, managedAssets: [] };
};

const validateCandidate = (snapshot: ContentSnapshot, candidate: NoteDocument, replacedSourcePath?: string): void => {
  const notes = snapshot.notes.filter(({ sourcePath }) => sourcePath !== replacedSourcePath).map(noteInput);
  const issues = validateContent(categoryInputs(snapshot), [...notes, noteInput(candidate)], siteConfig)
    .filter(({ sourcePath }) => sourcePath === candidate.sourcePath || !snapshot.issues.some((existing) => existing.sourcePath === sourcePath));
  if (issues.length > 0) throw new HttpError(400, 'validation_failed', 'Revisa los campos marcados antes de guardar.', issues);
};

const uploadOperations = async (
  repositoryRoot: string,
  input: NoteMutationInput,
  folder: string,
): Promise<Readonly<{ operations: ReadonlyArray<FileOperation>; expectedRevisions: Readonly<Record<string, null>>; changedPaths: ReadonlyArray<string> }>> => {
  const paths = createRepositoryPaths(repositoryRoot);
  const operations: FileOperation[] = [];
  const expectedRevisions: Record<string, null> = {};
  const changedPaths: string[] = [];
  const tokens = input.uploadTokens ?? [];
  if (input.format === 'video' && tokens.length > 0) throw new HttpError(400, 'video_has_upload', 'Las notas de video no admiten imágenes Markdown.');
  for (const token of tokens) {
    const { asset, bytes } = await loadStagedUpload(repositoryRoot, token);
    if (!input.body.includes(`(${asset.markdownReference})`)) {
      throw new HttpError(400, 'upload_not_referenced', `Inserta ${asset.markdownReference} en el Markdown antes de guardar.`);
    }
    const destination = noteAssetPath(paths, folder, asset.safeFileName);
    await assertNoSymlinkPath(paths.notesRoot, destination);
    const destinationPath = portable(relative(paths.repositoryRoot, destination));
    if (await fileExists(destination)) throw new HttpError(409, 'asset_destination_exists', `Ya existe el recurso ${destinationPath}.`);
    operations.push({ type: 'write', path: destinationPath, contents: bytes });
    operations.push({ type: 'delete', path: `.content-admin/uploads/${token}` });
    expectedRevisions[destinationPath] = null;
    changedPaths.push(destinationPath);
  }
  return { operations, expectedRevisions, changedPaths };
};

export const createNote = async (repositoryRoot: string, input: NoteMutationInput): Promise<Readonly<{
  note: NoteDocument;
  changedPaths: ReadonlyArray<string>;
}>> => {
  assertSlug(input.id, 'El ID de nota');
  assertSlug(input.category, 'La categoría');
  const paths = createRepositoryPaths(repositoryRoot);
  const destination = noteFilePath(paths, input.category, input.id);
  await assertNoSymlinkPath(paths.notesRoot, destination);
  const sourcePath = portable(relative(paths.repositoryRoot, destination));
  if (await fileExists(destination)) throw new HttpError(409, 'destination_exists', `Ya existe ${sourcePath}.`);
  const snapshot = await loadContentRepository(repositoryRoot);
  const candidate = inputToDocument(input, input.category, sourcePath);
  validateCandidate(snapshot, candidate);
  const serialized = serializeNoteDocument(null, input, input.body);
  const uploads = await uploadOperations(repositoryRoot, input, input.category);
  const operations: FileOperation[] = [{ type: 'write', path: sourcePath, contents: serialized }, ...uploads.operations];
  try {
    await commitFileTransaction({
      repositoryRoot,
      operations,
      expectedRevisions: { [sourcePath]: null, ...uploads.expectedRevisions },
    });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return {
    note: inputToDocument(input, input.category, sourcePath, sha256(serialized)),
    changedPaths: [sourcePath, ...uploads.changedPaths],
  };
};

export const updateNote = async (
  repositoryRoot: string,
  folder: string,
  noteId: string,
  revision: string,
  input: NoteMutationInput,
): Promise<Readonly<{ note: NoteDocument; changedPaths: ReadonlyArray<string> }>> => {
  assertSlug(folder, 'La carpeta');
  assertSlug(noteId, 'El ID de nota');
  if (input.id !== noteId) throw new HttpError(400, 'stable_identity', 'El ID de una nota existente no puede cambiar.');
  const paths = createRepositoryPaths(repositoryRoot);
  const destination = noteFilePath(paths, folder, noteId);
  const sourcePath = portable(relative(paths.repositoryRoot, destination));
  let original: string;
  try { original = await readFile(destination, 'utf8'); } catch { throw new HttpError(404, 'note_not_found', 'La nota ya no existe.'); }
  const snapshot = await loadContentRepository(repositoryRoot);
  const candidate = inputToDocument(input, folder, sourcePath);
  validateCandidate(snapshot, candidate, sourcePath);
  const serialized = serializeNoteDocument(original, input, input.body);
  const uploads = await uploadOperations(repositoryRoot, input, folder);
  try {
    await commitFileTransaction({
      repositoryRoot,
      operations: [{ type: 'write', path: sourcePath, contents: serialized }, ...uploads.operations],
      expectedRevisions: { [sourcePath]: revision, ...uploads.expectedRevisions },
    });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return { note: inputToDocument(input, folder, sourcePath, sha256(serialized)), changedPaths: [sourcePath, ...uploads.changedPaths] };
};
