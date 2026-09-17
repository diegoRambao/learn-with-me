import { access, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { handleTrashNoteRequest } from '../../../admin/src/pages/api/notes/[folder]/[noteId]/trash';
import { handleTrashCollectionRequest } from '../../../admin/src/pages/api/trash/index';
import { handleTrashEntryRequest } from '../../../admin/src/pages/api/trash/[trashId]';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';
import { loadContentRepository } from '../../../admin/src/lib/server/content-repository';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

const request = (url: string, method: string, body?: unknown): Request => new Request(`http://127.0.0.1:4322${url}`, {
  method,
  headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', ...(body ? { 'content-type': 'application/json', 'x-content-admin-token': getProcessCsrfToken() } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
});

const trashFixtureNote = async () => {
  const note = (await loadContentRepository(repository!.root)).notes[0];
  const response = await handleTrashNoteRequest(request(`/api/notes/${note.folder}/${note.id}/trash`, 'POST', { revision: note.revision }), repository!.root, note.folder, note.id);
  expect(response.status).toBe(200);
  return (await response.json()).data;
};

describe('trash API', () => {
  it('moves exact note bytes into a versioned bundle and removes it from active positions', async () => {
    repository = await createAdminRepository({
      'src/content/notes/dart/assets/diagram.png': new Uint8Array([1, 2, 3]),
      'src/content/notes/dart/intro.md': `---\ntitle: Introducción\ndescription: Nota\ntags: [dart]\ncategory: dart\ndurationMinutes: 5\nposition: 2\nformat: written\ntopic: fundamentos\n---\n\n![Diagrama](assets/diagram.png)\n`,
    });
    const original = await repository.read('src/content/notes/dart/intro.md');
    const trashed = await trashFixtureNote();
    await expect(access(join(repository.root, 'src/content/notes/dart/intro.md'))).rejects.toThrow();
    expect(await repository.read(`.content-admin/trash/notes/${trashed.trashId}/note.md`)).toBe(original);
    expect(await readFile(join(repository.root, `/.content-admin/trash/notes/${trashed.trashId}/assets/diagram.png`.slice(1)))).toEqual(Buffer.from([1, 2, 3]));
    expect((await loadContentRepository(repository.root)).notes).toHaveLength(0);
  });

  it('lists and restores a bundle without consuming it on collision', async () => {
    repository = await createAdminRepository();
    const trashed = await trashFixtureNote();
    const listed = await handleTrashCollectionRequest(request('/api/trash', 'GET'), repository.root);
    expect((await listed.json()).data[0]).toMatchObject({ trashId: trashed.trashId, canRestore: true });
    await repository.write('src/content/notes/dart/intro.md', 'collision');
    const conflict = await handleTrashEntryRequest(request(`/api/trash/${trashed.trashId}/restore`, 'POST', { manifestRevision: trashed.manifestRevision }), repository.root, trashed.trashId, 'restore');
    expect(conflict.status).toBe(409);
    await rm(join(repository.root, 'src/content/notes/dart/intro.md'));
    const restored = await handleTrashEntryRequest(request(`/api/trash/${trashed.trashId}/restore`, 'POST', { manifestRevision: trashed.manifestRevision }), repository.root, trashed.trashId, 'restore');
    expect(restored.status).toBe(200);
    expect(await repository.read('src/content/notes/dart/intro.md')).toContain('Introducción');
  });

  it('purges only after a separate exact confirmation and current manifest revision', async () => {
    repository = await createAdminRepository();
    const trashed = await trashFixtureNote();
    const wrong = await handleTrashEntryRequest(request(`/api/trash/${trashed.trashId}`, 'DELETE', { manifestRevision: trashed.manifestRevision, confirmTrashId: 'wrong' }), repository.root, trashed.trashId, 'purge');
    expect(wrong.status).toBe(400);
    const purged = await handleTrashEntryRequest(request(`/api/trash/${trashed.trashId}`, 'DELETE', { manifestRevision: trashed.manifestRevision, confirmTrashId: trashed.trashId }), repository.root, trashed.trashId, 'purge');
    expect(purged.status).toBe(204);
    await expect(access(join(repository.root, `.content-admin/trash/notes/${trashed.trashId}`))).rejects.toThrow();
  });
});
