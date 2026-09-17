import { describe, expect, it, vi } from 'vitest';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';
import { guardAdminRequest } from '../../../admin/src/middleware';

const request = (path: string, options: RequestInit & { host?: string } = {}): Request => new Request(`http://127.0.0.1:4322${path}`, {
  ...options,
  headers: { host: options.host ?? '127.0.0.1:4322', ...(options.headers ?? {}) },
});

describe('local administration boundary', () => {
  it.each([
    request('/api/bootstrap', { host: 'attacker.test' }),
    request('/api/bootstrap', { headers: { origin: 'https://attacker.test' } }),
  ])('rejects invalid Host/Origin before invoking content handlers', async (incoming) => {
    const next = vi.fn(async () => new Response('secret content'));
    const response = await guardAdminRequest(incoming, next);
    expect(response.status).toBe(403);
    expect(next).not.toHaveBeenCalled();
    expect(await response.text()).not.toContain('secret content');
  });

  it('requires the process token for mutations but not read-only bootstrap/preview', async () => {
    const next = vi.fn(async () => new Response('ok'));
    expect((await guardAdminRequest(request('/api/bootstrap'), next)).status).toBe(200);
    expect((await guardAdminRequest(request('/api/preview', { method: 'POST' }), next)).status).toBe(200);
    expect((await guardAdminRequest(request('/api/notes', { method: 'POST' }), next)).status).toBe(401);
    expect((await guardAdminRequest(request('/api/notes', { method: 'POST', headers: { 'x-content-admin-token': getProcessCsrfToken() } }), next)).status).toBe(200);
  });

  it('never emits permissive CORS headers or absolute filesystem details', async () => {
    const response = await guardAdminRequest(request('/api/bootstrap', { host: 'evil.test' }), async () => new Response());
    expect(response.headers.get('access-control-allow-origin')).toBeNull();
    expect(await response.text()).not.toMatch(/\/Users\/|[A-Z]:\\/);
  });
});
