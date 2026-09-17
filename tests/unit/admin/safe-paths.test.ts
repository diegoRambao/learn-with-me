import { mkdir, symlink } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import {
  assertNoSymlinkPath,
  assertSlug,
  categoryFilePath,
  createRepositoryPaths,
  noteAssetPath,
  noteFilePath,
  resolveContainedPath,
} from '../../../admin/src/lib/server/safe-paths';

let repository: AdminRepositoryFixture | undefined;

afterEach(async () => repository?.cleanup());

describe('safe administrative paths', () => {
  it('derives authorized category, note, and asset destinations from slugs', async () => {
    repository = await createAdminRepository();
    const paths = createRepositoryPaths(repository.root);

    expect(categoryFilePath(paths, 'dart')).toBe(join(repository.root, 'src/content/categories/dart.json'));
    expect(noteFilePath(paths, 'dart', 'types')).toBe(join(repository.root, 'src/content/notes/dart/types.md'));
    expect(noteAssetPath(paths, 'dart', 'diagram.png')).toBe(join(repository.root, 'src/content/notes/dart/assets/diagram.png'));
  });

  it('rejects malformed slugs, traversal, and paths outside a root', async () => {
    repository = await createAdminRepository();
    const paths = createRepositoryPaths(repository.root);

    expect(() => assertSlug('../outside', 'id')).toThrow(/slug/i);
    expect(() => resolveContainedPath(paths.notesRoot, '..', 'secret.md')).toThrow(/autorizada/i);
    expect(() => noteFilePath(paths, 'Dart', 'intro')).toThrow(/slug/i);
  });

  it('rejects symlinks anywhere below an authorized root', async () => {
    repository = await createAdminRepository();
    const paths = createRepositoryPaths(repository.root);
    const outside = join(repository.root, 'outside');
    const linked = join(paths.notesRoot, 'linked');
    await mkdir(dirname(linked), { recursive: true });
    await mkdir(outside, { recursive: true });
    await symlink(outside, linked);

    await expect(assertNoSymlinkPath(paths.notesRoot, join(linked, 'note.md'))).rejects.toThrow(/simbólico/i);
  });
});
