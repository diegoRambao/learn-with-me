import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { handleCreateNoteRequest } from '../../../admin/src/pages/api/notes/index';
import { handleUploadRequest } from '../../../admin/src/pages/api/uploads';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

const notePayload = {
  id: 'nueva-nota', title: 'Nueva nota', description: 'Resumen', tags: ['dart'], category: 'dart',
  topic: 'fundamentos', durationMinutes: 6, position: 3, format: 'written', body: '# Contenido', uploadTokens: [],
};

const jsonRequest = (payload: unknown): Request => new Request('http://127.0.0.1:4322/api/notes', {
  method: 'POST',
  headers: {
    host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322',
    'content-type': 'application/json', 'x-content-admin-token': getProcessCsrfToken(),
  },
  body: JSON.stringify(payload),
});

const uploadRequest = (): Request => {
  const body = new FormData();
  body.append('image', new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1])], 'diagram.png', { type: 'image/png' }));
  return new Request('http://127.0.0.1:4322/api/uploads', {
    method: 'POST',
    headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', 'x-content-admin-token': getProcessCsrfToken() },
    body,
  });
};

describe('POST /api/notes', () => {
  it('creates written and video notes with server-derived destinations', async () => {
    repository = await createAdminRepository();
    const written = await handleCreateNoteRequest(jsonRequest(notePayload), repository.root);
    expect(written.status).toBe(201);
    const parsed = matter(await repository.read('src/content/notes/dart/nueva-nota.md'));
    expect(parsed.data).toMatchObject({ title: 'Nueva nota', category: 'dart', format: 'written' });
    expect(parsed.content).toContain('# Contenido');

    const video = await handleCreateNoteRequest(jsonRequest({ ...notePayload, id: 'video', title: 'Video', position: 4, format: 'video', body: '', youtubeVideoId: 'M7lc1UVf-VE' }), repository.root);
    expect(video.status).toBe(201);
    expect(matter(await repository.read('src/content/notes/dart/video.md')).data.youtubeVideoId).toBe('M7lc1UVf-VE');
  });

  it('returns 400 for graph errors and makes zero active changes', async () => {
    repository = await createAdminRepository();
    const response = await handleCreateNoteRequest(jsonRequest({ ...notePayload, topic: 'other-category', position: 2 }), repository.root);
    expect(response.status).toBe(400);
    await expect(access(join(repository.root, 'src/content/notes/dart/nueva-nota.md'))).rejects.toThrow();
  });

  it('returns 409 instead of overwriting an existing destination', async () => {
    repository = await createAdminRepository({ 'src/content/notes/dart/nueva-nota.md': 'keep me' });
    const response = await handleCreateNoteRequest(jsonRequest(notePayload), repository.root);
    expect(response.status).toBe(409);
    expect(await repository.read('src/content/notes/dart/nueva-nota.md')).toBe('keep me');
  });

  it('consumes a referenced upload in the same successful transaction', async () => {
    repository = await createAdminRepository();
    const upload = await (await handleUploadRequest(uploadRequest(), repository.root)).json();
    const response = await handleCreateNoteRequest(jsonRequest({
      ...notePayload,
      body: '# Contenido\n\n![Diagrama](assets/diagram.png)',
      uploadTokens: [upload.data.uploadToken],
    }), repository.root);
    expect(response.status).toBe(201);
    expect(await readFile(join(repository.root, 'src/content/notes/dart/assets/diagram.png'))).toBeTruthy();
    await expect(access(join(repository.root, '.content-admin/uploads', upload.data.uploadToken))).rejects.toThrow();
  });
});
