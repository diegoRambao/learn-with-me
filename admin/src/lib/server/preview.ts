import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import rehypeYouTubeEmbeds from '../../../../src/lib/rehype-youtube-embeds';
import { HttpError } from './http-guard';

export type PreviewPayload = Readonly<{
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  durationMinutes: number;
  format: 'written' | 'video';
  body: string;
  youtubeVideoId?: string;
}>;

const maximumMarkdownBytes = 500_000;
const processor = createMarkdownProcessor({ gfm: true, rehypePlugins: [rehypeYouTubeEmbeds] });

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const sanitizeFragment = (value: string): string => value
  .replace(/<(script|style|form|input|button|object|embed|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<(script|style|form|input|button|object|embed|meta|link)\b[^>]*\/?\s*>/gi, '')
  .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');

const validatePreview = (payload: PreviewPayload): void => {
  if (!payload || typeof payload !== 'object') throw new HttpError(400, 'validation_failed', 'Revisa los datos de la vista previa.');
  if (typeof payload.title !== 'string' || typeof payload.description !== 'string' || !Array.isArray(payload.tags)) {
    throw new HttpError(400, 'validation_failed', 'Completa los metadatos antes de previsualizar.');
  }
  if (payload.format === 'written') {
    if (typeof payload.body !== 'string') throw new HttpError(400, 'validation_failed', 'Añade contenido Markdown válido.');
    if (Buffer.byteLength(payload.body) > maximumMarkdownBytes) throw new HttpError(413, 'preview_too_large', 'El Markdown supera el límite de 500 KB.');
  } else if (payload.format === 'video') {
    if (!/^[A-Za-z0-9_-]{11}$/.test(payload.youtubeVideoId ?? '') || payload.body?.trim()) {
      throw new HttpError(400, 'validation_failed', 'Revisa el ID de YouTube y deja vacío el cuerpo de la nota de video.');
    }
  } else {
    throw new HttpError(400, 'validation_failed', 'Selecciona un formato de nota válido.');
  }
};

export const renderNotePreview = async (payload: PreviewPayload): Promise<string> => {
  validatePreview(payload);
  const markdown = payload.format === 'video'
    ? `https://www.youtube.com/watch?v=${payload.youtubeVideoId}`
    : payload.body;
  const rendered = await (await processor).render(markdown);
  const content = sanitizeFragment(rendered.code);
  const tags = payload.tags.map((tag) => `<li>${escapeHtml(String(tag))}</li>`).join('');
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: http://127.0.0.1; frame-src https://www.youtube-nocookie.com; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width"><style>body{font:16px/1.6 Georgia,serif;margin:0;padding:2rem;color:#1b1b18;background:#fffdf7}h1{font-size:2.2rem;line-height:1.05}header{border-bottom:1px solid #d8d3c5;margin-bottom:1.5rem}.meta,ul{color:#666;font:14px/1.4 sans-serif}ul{display:flex;gap:.5rem;list-style:none;padding:0}.youtube-embed-frame{aspect-ratio:16/9}.youtube-embed-frame iframe{width:100%;height:100%;border:0}img{max-width:100%;height:auto}pre{overflow:auto;padding:1rem;background:#f1eee5}</style></head><body><header><p class="meta">${escapeHtml(String(payload.durationMinutes))} min · ${escapeHtml(payload.format)}</p><h1>${escapeHtml(payload.title)}</h1><p>${escapeHtml(payload.description)}</p><ul>${tags}</ul></header><main>${content}</main></body></html>`;
};
