import { randomUUID } from 'node:crypto';
import { access, cp, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { revisionForFile } from './revisions';
import { createRepositoryPaths, resolveContainedPath } from './safe-paths';

export type FileOperation =
  | Readonly<{ type: 'write'; path: string; contents: string | Uint8Array }>
  | Readonly<{ type: 'move'; sourcePath: string; destinationPath: string }>
  | Readonly<{ type: 'delete'; path: string }>;

type AffectedPath = Readonly<{ path: string; existed: boolean; backupPath?: string }>;
type TransactionManifest = Readonly<{
  transactionId: string;
  status: 'prepared' | 'committing' | 'committed' | 'rollingBack';
  affectedPaths: ReadonlyArray<AffectedPath>;
}>;

export class TransactionConflictError extends Error {
  readonly code = 'stale_revision';
}

const exists = async (path: string): Promise<boolean> => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};

const safeAbsolute = (repositoryRoot: string, repositoryPath: string): string => {
  if (repositoryPath.startsWith('/') || repositoryPath.split('/').includes('..')) {
    throw new Error('La transacción contiene una ruta no autorizada.');
  }
  return resolveContainedPath(repositoryRoot, ...repositoryPath.split('/'));
};

const operationPaths = (operation: FileOperation): ReadonlyArray<string> => {
  if (operation.type === 'move') return [operation.sourcePath, operation.destinationPath];
  return [operation.path];
};

const writeManifest = async (transactionRoot: string, manifest: TransactionManifest): Promise<void> => {
  const path = join(transactionRoot, 'manifest.json');
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(temporaryPath, path);
};

const rollbackManifest = async (repositoryRoot: string, transactionRoot: string, manifest: TransactionManifest): Promise<void> => {
  const descending = [...manifest.affectedPaths].sort((left, right) => right.path.split('/').length - left.path.split('/').length);
  for (const affected of descending) await rm(safeAbsolute(repositoryRoot, affected.path), { recursive: true, force: true });
  const ascending = [...manifest.affectedPaths].sort((left, right) => left.path.split('/').length - right.path.split('/').length);
  for (const affected of ascending) {
    if (!affected.existed || !affected.backupPath) continue;
    const destination = safeAbsolute(repositoryRoot, affected.path);
    await mkdir(dirname(destination), { recursive: true });
    await cp(join(transactionRoot, affected.backupPath), destination, { recursive: true, preserveTimestamps: true });
  }
};

export const recoverFileTransactions = async (repositoryRoot: string): Promise<void> => {
  const { transactionsRoot } = createRepositoryPaths(repositoryRoot);
  let transactionIds: ReadonlyArray<string> = [];
  try {
    transactionIds = await readdir(transactionsRoot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  for (const transactionId of transactionIds) {
    const transactionRoot = join(transactionsRoot, transactionId);
    try {
      const manifest = JSON.parse(await readFile(join(transactionRoot, 'manifest.json'), 'utf8')) as TransactionManifest;
      if (manifest.status !== 'committed') await rollbackManifest(repositoryRoot, transactionRoot, manifest);
      await rm(transactionRoot, { recursive: true, force: true });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
};

export const commitFileTransaction = async (options: Readonly<{
  repositoryRoot: string;
  operations: ReadonlyArray<FileOperation>;
  expectedRevisions?: Readonly<Record<string, string | null>>;
  injectFailureAfterOperation?: number;
}>): Promise<Readonly<{ transactionId: string; changedPaths: ReadonlyArray<string> }>> => {
  const repositoryRoot = createRepositoryPaths(options.repositoryRoot).repositoryRoot;
  for (const [path, expectedRevision] of Object.entries(options.expectedRevisions ?? {})) {
    const absolutePath = safeAbsolute(repositoryRoot, path);
    const pathExists = await exists(absolutePath);
    if (expectedRevision === null && pathExists) throw new TransactionConflictError(`El destino ${path} ya existe.`);
    if (expectedRevision !== null && (!pathExists || await revisionForFile(absolutePath) !== expectedRevision)) {
      throw new TransactionConflictError(`El archivo ${path} cambió desde que se abrió.`);
    }
  }

  const transactionId = randomUUID();
  const transactionRoot = join(createRepositoryPaths(repositoryRoot).transactionsRoot, transactionId);
  await mkdir(join(transactionRoot, 'backups'), { recursive: true });
  await mkdir(join(transactionRoot, 'staged'), { recursive: true });
  const paths = [...new Set(options.operations.flatMap(operationPaths))];
  const affectedPaths: AffectedPath[] = [];
  for (const [index, path] of paths.entries()) {
    const absolutePath = safeAbsolute(repositoryRoot, path);
    const pathExists = await exists(absolutePath);
    const backupPath = pathExists ? `backups/${index}` : undefined;
    if (backupPath) await cp(absolutePath, join(transactionRoot, backupPath), { recursive: true, preserveTimestamps: true });
    affectedPaths.push({ path, existed: pathExists, ...(backupPath ? { backupPath } : {}) });
  }

  const stagedPaths = new Map<number, string>();
  for (const [index, operation] of options.operations.entries()) {
    if (operation.type !== 'write') continue;
    const stagedPath = join(transactionRoot, 'staged', String(index));
    await writeFile(stagedPath, operation.contents);
    stagedPaths.set(index, stagedPath);
  }

  let manifest: TransactionManifest = { transactionId, status: 'prepared', affectedPaths };
  await writeManifest(transactionRoot, manifest);
  manifest = { ...manifest, status: 'committing' };
  await writeManifest(transactionRoot, manifest);

  try {
    for (const [index, operation] of options.operations.entries()) {
      if (operation.type === 'write') {
        const destination = safeAbsolute(repositoryRoot, operation.path);
        await mkdir(dirname(destination), { recursive: true });
        await rename(stagedPaths.get(index) as string, destination);
      } else if (operation.type === 'move') {
        const source = safeAbsolute(repositoryRoot, operation.sourcePath);
        const destination = safeAbsolute(repositoryRoot, operation.destinationPath);
        await mkdir(dirname(destination), { recursive: true });
        await rename(source, destination);
      } else {
        await rm(safeAbsolute(repositoryRoot, operation.path), { recursive: true, force: true });
      }
      if (options.injectFailureAfterOperation === index + 1) throw new Error('Fallo simulado durante el commit.');
    }
    manifest = { ...manifest, status: 'committed' };
    await writeManifest(transactionRoot, manifest);
    await rm(transactionRoot, { recursive: true, force: true });
    return { transactionId, changedPaths: [...new Set(options.operations.flatMap(operationPaths))] };
  } catch (error) {
    manifest = { ...manifest, status: 'rollingBack' };
    await writeManifest(transactionRoot, manifest);
    await rollbackManifest(repositoryRoot, transactionRoot, manifest);
    await rm(transactionRoot, { recursive: true, force: true });
    throw error;
  }
};
