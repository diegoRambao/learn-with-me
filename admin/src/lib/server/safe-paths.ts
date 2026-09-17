import { lstat } from 'node:fs/promises';
import { basename, isAbsolute, relative, resolve, sep } from 'node:path';

export type RepositoryPaths = Readonly<{
  repositoryRoot: string;
  categoriesRoot: string;
  notesRoot: string;
  categoryImagesRoot: string;
  runtimeRoot: string;
  uploadsRoot: string;
  transactionsRoot: string;
  trashRoot: string;
}>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const assetNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*\.(?:png|jpe?g|webp|gif|svg)$/;

export const createRepositoryPaths = (root: string): RepositoryPaths => {
  const repositoryRoot = resolve(root);
  const runtimeRoot = resolve(repositoryRoot, '.content-admin');
  return {
    repositoryRoot,
    categoriesRoot: resolve(repositoryRoot, 'src/content/categories'),
    notesRoot: resolve(repositoryRoot, 'src/content/notes'),
    categoryImagesRoot: resolve(repositoryRoot, 'public/images/categories'),
    runtimeRoot,
    uploadsRoot: resolve(runtimeRoot, 'uploads'),
    transactionsRoot: resolve(runtimeRoot, 'transactions'),
    trashRoot: resolve(runtimeRoot, 'trash'),
  };
};

export const assertSlug = (value: string, label = 'ID'): string => {
  if (!slugPattern.test(value)) throw new Error(`${label} debe usar formato slug.`);
  return value;
};

export const resolveContainedPath = (root: string, ...segments: ReadonlyArray<string>): string => {
  if (segments.some((segment) => isAbsolute(segment))) throw new Error('La ruta debe permanecer dentro de la raíz autorizada.');
  const target = resolve(root, ...segments);
  const relativePath = relative(resolve(root), target);
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error('La ruta debe permanecer dentro de la raíz autorizada.');
  }
  return target;
};

export const assertNoSymlinkPath = async (root: string, target: string): Promise<void> => {
  const relativePath = relative(resolve(root), resolve(target));
  if (relativePath === '..' || relativePath.startsWith(`..${sep}`) || isAbsolute(relativePath)) {
    throw new Error('La ruta debe permanecer dentro de la raíz autorizada.');
  }

  let current = resolve(root);
  for (const segment of relativePath.split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    try {
      if ((await lstat(current)).isSymbolicLink()) throw new Error('No se permiten enlaces simbólicos en rutas administradas.');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
};

export const categoryFilePath = (paths: RepositoryPaths, categoryId: string): string =>
  resolveContainedPath(paths.categoriesRoot, `${assertSlug(categoryId, 'El ID de categoría')}.json`);

export const noteFilePath = (paths: RepositoryPaths, folder: string, noteId: string): string =>
  resolveContainedPath(paths.notesRoot, assertSlug(folder, 'La carpeta'), `${assertSlug(noteId, 'El ID de nota')}.md`);

export const normalizeAssetFileName = (originalName: string): string => {
  const safeBase = basename(originalName).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const extension = safeBase.match(/\.(png|jpe?g|webp|gif|svg)$/)?.[0] ?? '';
  const stem = safeBase.slice(0, extension ? -extension.length : undefined)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const normalized = `${stem || 'imagen'}${extension === '.jpeg' ? '.jpg' : extension}`;
  if (!assetNamePattern.test(normalized)) throw new Error('El nombre o extensión de la imagen no es válido.');
  return normalized;
};

export const noteAssetPath = (paths: RepositoryPaths, folder: string, fileName: string): string => {
  assertSlug(folder, 'La carpeta');
  if (!assetNamePattern.test(fileName)) throw new Error('El recurso debe usar un basename y extensión admitidos.');
  return resolveContainedPath(paths.notesRoot, folder, 'assets', fileName);
};

export const toRepositoryPath = (paths: RepositoryPaths, absolutePath: string): string =>
  relative(paths.repositoryRoot, resolveContainedPath(paths.repositoryRoot, relative(paths.repositoryRoot, absolutePath))).replaceAll(sep, '/');
