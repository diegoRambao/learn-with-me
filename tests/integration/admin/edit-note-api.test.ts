import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { handleNoteRequest } from '../../../admin/src/pages/api/notes/[folder]/[noteId]/index';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';
import { loadContentRepository } from '../../../admin/src/lib/server/content-repository';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

const request = (payload: unknown): Request => new Request('http://127.0.0.1:4322/api/notes/dart/intro', {
  method: 'PUT', headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', 'content-type': 'application/json', 'x-content-admin-token': getProcessCsrfToken() },
  body: JSON.stringify(payload),
});

describe('PUT /api/notes/{folder}/{noteId}', () => {
  it('preserves stable path, unmanaged frontmatter, and unrelated files byte-for-byte', async () => {
    repository = await createAdminRepository({ 'unrelated.bin': new Uint8Array([0, 1, 2, 255]) });
    const note = (await loadContentRepository(repository.root)).notes[0];
    const unrelated = await readFile(join(repository.root, 'unrelated.bin'));
    const response = await handleNoteRequest(request({
      revision: note.revision, id: note.id, title: 'Editada', description: note.description, tags: ['dart', 'editada'],
      category: note.category, topic: note.topic, durationMinutes: note.durationMinutes, position: note.position,
      format: 'written', body: '# Nuevo cuerpo', uploadTokens: [],
    }), repository.root, note.folder, note.id);
    expect(response.status).toBe(200);
    const parsed = matter(await repository.read(note.sourcePath));
    expect(parsed.data).toMatchObject({ title: 'Editada', customKey: 'conservar' });
    expect(await readFile(join(repository.root, 'unrelated.bin'))).toEqual(unrelated);
    expect((await response.json()).changedPaths).toEqual([note.sourcePath]);
  });

  it('keeps the physical folder when category changes', async () => {
    repository = await createAdminRepository({
      'src/content/categories/web.json': JSON.stringify({ name: 'Web', description: 'Web', image: '/images/categories/web.svg', level: 'beginner', topics: [] }),
    });
    const note = (await loadContentRepository(repository.root)).notes[0];
    const response = await handleNoteRequest(request({
      revision: note.revision, id: note.id, title: note.title, description: note.description, tags: note.tags,
      category: 'web', durationMinutes: note.durationMinutes, position: 1, format: 'written', body: note.body, uploadTokens: [],
    }), repository.root, note.folder, note.id);
    expect(response.status).toBe(200);
    expect(matter(await repository.read('src/content/notes/dart/intro.md')).data.category).toBe('web');
  });

  it('returns 409 for an external revision change and leaves external bytes intact', async () => {
    repository = await createAdminRepository();
    const note = (await loadContentRepository(repository.root)).notes[0];
    await repository.write(note.sourcePath, 'external bytes');
    const response = await handleNoteRequest(request({
      revision: note.revision, id: note.id, title: 'Draft', description: note.description, tags: note.tags,
      category: note.category, topic: note.topic, durationMinutes: note.durationMinutes, position: note.position,
      format: 'written', body: '# draft', uploadTokens: [],
    }), repository.root, note.folder, note.id);
    expect(response.status).toBe(409);
    expect(await repository.read(note.sourcePath)).toBe('external bytes');
  });
});
