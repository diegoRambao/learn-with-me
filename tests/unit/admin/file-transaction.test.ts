import { access, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { commitFileTransaction, recoverFileTransactions, TransactionConflictError } from '../../../admin/src/lib/server/file-transaction';
import { sha256, verifyRevision } from '../../../admin/src/lib/server/revisions';
import { createMutationCoordinator } from '../../../admin/src/lib/server/mutation-coordinator';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

describe('file revisions and transactions', () => {
  it('hashes original bytes and checks exact optimistic revisions', async () => {
    const bytes = new TextEncoder().encode('á\r\nbytes');
    const revision = sha256(bytes);
    expect(revision).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyRevision(bytes, revision)).toBe(true);
    expect(verifyRevision(new TextEncoder().encode('different'), revision)).toBe(false);
  });

  it('commits writes atomically and rejects stale preconditions', async () => {
    repository = await createAdminRepository();
    const relativePath = 'src/content/categories/dart.json';
    const original = await repository.read(relativePath);

    await commitFileTransaction({
      repositoryRoot: repository.root,
      operations: [{ type: 'write', path: relativePath, contents: 'updated\n' }],
      expectedRevisions: { [relativePath]: sha256(original) },
    });
    expect(await repository.read(relativePath)).toBe('updated\n');

    await expect(commitFileTransaction({
      repositoryRoot: repository.root,
      operations: [{ type: 'write', path: relativePath, contents: 'stale\n' }],
      expectedRevisions: { [relativePath]: sha256(original) },
    })).rejects.toBeInstanceOf(TransactionConflictError);
  });

  it('rolls back every affected path when a later rename fails', async () => {
    repository = await createAdminRepository();
    const first = 'src/content/categories/dart.json';
    const second = 'src/content/notes/dart/intro.md';
    const beforeFirst = await repository.read(first);
    const beforeSecond = await repository.read(second);

    await expect(commitFileTransaction({
      repositoryRoot: repository.root,
      operations: [
        { type: 'write', path: first, contents: 'first changed\n' },
        { type: 'write', path: second, contents: 'second changed\n' },
      ],
      injectFailureAfterOperation: 1,
    })).rejects.toThrow(/simulado/i);

    expect(await repository.read(first)).toBe(beforeFirst);
    expect(await repository.read(second)).toBe(beforeSecond);
  });

  it('recovers an interrupted committing journal after restart', async () => {
    repository = await createAdminRepository();
    const relativePath = 'src/content/categories/dart.json';
    const original = await repository.read(relativePath);
    const transactionRoot = join(repository.root, '.content-admin/transactions/interrupted');
    await repository.write('.content-admin/transactions/interrupted/backups/0', original);
    await repository.write('.content-admin/transactions/interrupted/manifest.json', JSON.stringify({
      transactionId: 'interrupted',
      status: 'committing',
      affectedPaths: [{ path: relativePath, existed: true, backupPath: 'backups/0' }],
    }));
    await writeFile(join(repository.root, relativePath), 'partial');

    await recoverFileTransactions(repository.root);
    expect(await repository.read(relativePath)).toBe(original);
    await expect(access(transactionRoot)).rejects.toThrow();
  });

  it('serializes concurrent mutations through one coordinator', async () => {
    repository = await createAdminRepository();
    const coordinator = createMutationCoordinator(repository.root);
    const events: string[] = [];
    const first = coordinator.run(async () => {
      events.push('first:start');
      await new Promise((resolve) => setTimeout(resolve, 15));
      events.push('first:end');
    });
    const second = coordinator.run(async () => events.push('second'));
    await Promise.all([first, second]);
    expect(events).toEqual(['first:start', 'first:end', 'second']);
  });
});
