import { readFile } from 'node:fs/promises';
import { relative, sep } from 'node:path';
import { siteConfig } from '../../../../src/data/site';
import { validateContent, type CategoryInput, type NoteInput } from '../../../../src/lib/validation';
import type { CategoryDocument, CategoryMutationInput, ContentSnapshot, NoteDocument, TopicMutationInput } from '../contracts';
import { serializeCategoryDocument } from './content-serialization';
import { loadContentRepository } from './content-repository';
import { commitFileTransaction, TransactionConflictError } from './file-transaction';
import { HttpError } from './http-guard';
import { assertNoSymlinkPath, assertSlug, categoryFilePath, createRepositoryPaths } from './safe-paths';

const portable = (value: string): string => value.replaceAll(sep, '/');

const toCategoryInput = (category: CategoryDocument): CategoryInput => ({
  sourcePath: category.sourcePath, id: category.id, name: category.name, description: category.description,
  image: category.image, level: category.level, topics: category.topics,
});

const toNoteInput = (note: NoteDocument): NoteInput => ({
  sourcePath: note.sourcePath, folder: note.folder, depth: 2, id: note.id, title: note.title,
  description: note.description, tags: note.tags, category: note.category, topic: note.topic,
  durationMinutes: note.durationMinutes, position: note.position, format: note.format, body: note.body,
  youtubeVideoId: note.format === 'video' ? note.youtubeVideoId : undefined,
});

const validateProposedCategory = (
  snapshot: ContentSnapshot,
  category: CategoryDocument,
  replacedCategoryId?: string,
): void => {
  const categories = snapshot.categories.filter(({ id }) => id !== replacedCategoryId).map(toCategoryInput);
  const issues = validateContent([...categories, toCategoryInput(category)], snapshot.notes.map(toNoteInput), siteConfig)
    .filter(({ sourcePath }) => sourcePath === category.sourcePath || !snapshot.issues.some((existing) => existing.sourcePath === sourcePath));
  if (issues.length > 0) throw new HttpError(400, 'validation_failed', 'Revisa los campos marcados antes de guardar.', issues);
};

const findCategory = (snapshot: ContentSnapshot, categoryId: string): CategoryDocument => {
  const category = snapshot.categories.find(({ id }) => id === categoryId);
  if (!category) throw new HttpError(404, 'category_not_found', 'La categoría ya no existe.');
  return category;
};

const commitCategory = async (
  repositoryRoot: string,
  category: CategoryDocument,
  original: string | null,
  expectedRevision: string | null,
): Promise<CategoryDocument> => {
  const serialized = serializeCategoryDocument(original, {
    name: category.name,
    description: category.description,
    image: category.image,
    level: category.level,
    topics: category.topics.map(({ id, name, position }) => ({ id, name, position })),
  });
  try {
    await commitFileTransaction({
      repositoryRoot,
      operations: [{ type: 'write', path: category.sourcePath, contents: serialized }],
      expectedRevisions: { [category.sourcePath]: expectedRevision },
    });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return findCategory(await loadContentRepository(repositoryRoot), category.id);
};

export const createCategory = async (repositoryRoot: string, input: CategoryMutationInput): Promise<CategoryDocument> => {
  assertSlug(input.id, 'El ID de categoría');
  const paths = createRepositoryPaths(repositoryRoot);
  const absolutePath = categoryFilePath(paths, input.id);
  await assertNoSymlinkPath(paths.categoriesRoot, absolutePath);
  const sourcePath = portable(relative(paths.repositoryRoot, absolutePath));
  const snapshot = await loadContentRepository(repositoryRoot);
  if (snapshot.categories.some(({ id }) => id === input.id)) throw new HttpError(409, 'destination_exists', `Ya existe la categoría ${input.id}.`);
  const category: CategoryDocument = {
    ...input,
    topics: (input.topics ?? []).map((topic) => ({ ...topic, categoryId: input.id })),
    sourcePath,
    revision: '',
  };
  validateProposedCategory(snapshot, category);
  return commitCategory(repositoryRoot, category, null, null);
};

export const updateCategory = async (
  repositoryRoot: string,
  categoryId: string,
  revision: string,
  input: Omit<CategoryMutationInput, 'id' | 'topics'>,
): Promise<CategoryDocument> => {
  assertSlug(categoryId, 'El ID de categoría');
  const snapshot = await loadContentRepository(repositoryRoot);
  const current = findCategory(snapshot, categoryId);
  const category = { ...current, ...input, id: current.id, topics: current.topics };
  validateProposedCategory(snapshot, category, categoryId);
  return commitCategory(repositoryRoot, category, await readFile(categoryFilePath(createRepositoryPaths(repositoryRoot), categoryId), 'utf8'), revision);
};

export const deleteCategory = async (
  repositoryRoot: string,
  categoryId: string,
  revision: string,
  confirmation: string,
): Promise<ReadonlyArray<string>> => {
  const snapshot = await loadContentRepository(repositoryRoot);
  const category = findCategory(snapshot, categoryId);
  if (confirmation !== categoryId) throw new HttpError(400, 'confirmation_mismatch', 'Escribe el ID exacto de la categoría para confirmar.');
  const dependencies = snapshot.notes.filter(({ category: noteCategory }) => noteCategory === categoryId).map(({ id }) => id);
  if (dependencies.length > 0) throw new HttpError(409, 'category_has_notes', 'Reasigna o elimina las notas relacionadas antes de borrar la categoría.', undefined, dependencies);
  try {
    await commitFileTransaction({ repositoryRoot, operations: [{ type: 'delete', path: category.sourcePath }], expectedRevisions: { [category.sourcePath]: revision } });
  } catch (error) {
    if (error instanceof TransactionConflictError) throw new HttpError(409, error.code, error.message);
    throw error;
  }
  return [category.sourcePath];
};

export const createTopic = async (
  repositoryRoot: string,
  categoryId: string,
  categoryRevision: string,
  input: TopicMutationInput,
): Promise<CategoryDocument> => {
  assertSlug(input.id, 'El ID de tema');
  const snapshot = await loadContentRepository(repositoryRoot);
  const current = findCategory(snapshot, categoryId);
  const category = { ...current, topics: [...current.topics, { ...input, categoryId }] };
  validateProposedCategory(snapshot, category, categoryId);
  return commitCategory(repositoryRoot, category, await readFile(categoryFilePath(createRepositoryPaths(repositoryRoot), categoryId), 'utf8'), categoryRevision);
};

export const updateTopic = async (
  repositoryRoot: string,
  categoryId: string,
  topicId: string,
  categoryRevision: string,
  name: string,
): Promise<CategoryDocument> => {
  const snapshot = await loadContentRepository(repositoryRoot);
  const current = findCategory(snapshot, categoryId);
  if (!current.topics.some(({ id }) => id === topicId)) throw new HttpError(404, 'topic_not_found', 'El tema ya no existe.');
  const category = { ...current, topics: current.topics.map((topic) => topic.id === topicId ? { ...topic, name } : topic) };
  validateProposedCategory(snapshot, category, categoryId);
  return commitCategory(repositoryRoot, category, await readFile(categoryFilePath(createRepositoryPaths(repositoryRoot), categoryId), 'utf8'), categoryRevision);
};

export const deleteTopic = async (
  repositoryRoot: string,
  categoryId: string,
  topicId: string,
  categoryRevision: string,
): Promise<CategoryDocument> => {
  const snapshot = await loadContentRepository(repositoryRoot);
  const current = findCategory(snapshot, categoryId);
  const dependencies = snapshot.notes.filter((note) => note.category === categoryId && note.topic === topicId).map(({ id }) => id);
  if (dependencies.length > 0) throw new HttpError(409, 'topic_has_notes', 'Reasigna las notas relacionadas antes de borrar el tema.', undefined, dependencies);
  if (!current.topics.some(({ id }) => id === topicId)) throw new HttpError(404, 'topic_not_found', 'El tema ya no existe.');
  const category = { ...current, topics: current.topics.filter(({ id }) => id !== topicId) };
  validateProposedCategory(snapshot, category, categoryId);
  return commitCategory(repositoryRoot, category, await readFile(categoryFilePath(createRepositoryPaths(repositoryRoot), categoryId), 'utf8'), categoryRevision);
};
