import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { handleUploadRequest } from '../../../admin/src/pages/api/uploads';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';
import { sha256 } from '../../../admin/src/lib/server/revisions';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

const uploadRequest = (bytes: Uint8Array, name: string, type: string): Request => {
  const body = new FormData();
  body.append('image', new File([bytes.slice().buffer as ArrayBuffer], name, { type }));
  return new Request('http://127.0.0.1:4322/api/uploads', {
    method: 'POST',
    headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', 'x-content-admin-token': getProcessCsrfToken() },
    body,
  });
};

describe('POST /api/uploads', () => {
  it('stages an allowed image byte-for-byte behind an opaque token', async () => {
    repository = await createAdminRepository();
    const response = await handleUploadRequest(uploadRequest(png, 'Diagrama Final.PNG', 'image/png'), repository.root);
    const payload = await response.json();
    expect(response.status).toBe(201);
    expect(payload.data.uploadToken).not.toContain('/');
    expect(payload.data.safeFileName).toBe('diagrama-final.png');
    expect(payload.data.sha256).toBe(sha256(png));
    const staged = await readFile(join(repository.root, '.content-admin/uploads', payload.data.uploadToken, 'blob'));
    expect(staged).toEqual(Buffer.from(png));
  });

  it.each([
    ['photo.jpg', 'image/jpeg', new Uint8Array([0xff, 0xd8, 0xff, 0xdb])],
    ['image.webp', 'image/webp', new TextEncoder().encode('RIFFxxxxWEBPdata')],
    ['image.gif', 'image/gif', new TextEncoder().encode('GIF89a')],
    ['vector.svg', 'image/svg+xml', new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
  ])('accepts %s when declared type and bytes agree', async (name, type, bytes) => {
    repository = await createAdminRepository();
    expect((await handleUploadRequest(uploadRequest(bytes, name, type), repository.root)).status).toBe(201);
  });

  it('returns 415 for disguised content and 413 above 10 MiB', async () => {
    repository = await createAdminRepository();
    expect((await handleUploadRequest(uploadRequest(new TextEncoder().encode('not png'), 'fake.png', 'image/png'), repository.root)).status).toBe(415);
    expect((await handleUploadRequest(uploadRequest(new Uint8Array(10 * 1024 * 1024 + 1), 'huge.png', 'image/png'), repository.root)).status).toBe(413);
  });

  it('does not leave a staged directory when validation fails', async () => {
    repository = await createAdminRepository();
    await handleUploadRequest(uploadRequest(new Uint8Array([1]), 'bad.exe', 'application/octet-stream'), repository.root);
    await expect(access(join(repository.root, '.content-admin/uploads'))).rejects.toThrow();
  });
});
