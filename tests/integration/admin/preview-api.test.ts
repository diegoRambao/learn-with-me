import { describe, expect, it } from 'vitest';
import { handlePreviewRequest } from '../../../admin/src/pages/api/preview';

const request = (payload: unknown): Request => new Request('http://127.0.0.1:4322/api/preview', {
  method: 'POST',
  headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', 'content-type': 'application/json' },
  body: JSON.stringify(payload),
});

describe('POST /api/preview', () => {
  it('renders written Markdown into a sandbox-compatible document without writing files', async () => {
    const response = await handlePreviewRequest(request({ title: 'Guía', description: 'Resumen', tags: ['astro'], durationMinutes: 4, format: 'written', body: '# Hola\n\n**Mundo**' }));
    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.data.html).toContain('<h1 id="hola">Hola</h1>');
    expect(payload.data.html).toContain('Content-Security-Policy');
    expect(payload.data.html).not.toContain('<script');
  });

  it('renders a video note with the privacy-enhanced YouTube player', async () => {
    const response = await handlePreviewRequest(request({ title: 'Video', description: 'Resumen', tags: ['video'], durationMinutes: 4, format: 'video', youtubeVideoId: 'M7lc1UVf-VE', body: '' }));
    expect((await response.text())).toContain('youtube-nocookie.com/embed/M7lc1UVf-VE');
  });

  it('rejects invalid variants and oversized Markdown', async () => {
    const invalid = await handlePreviewRequest(request({ format: 'video', youtubeVideoId: 'bad', body: 'markdown' }));
    expect(invalid.status).toBe(400);
    const oversized = await handlePreviewRequest(request({ format: 'written', title: 'x', description: 'x', tags: ['x'], durationMinutes: 1, body: 'x'.repeat(550_000) }));
    expect(oversized.status).toBe(413);
  });
});
