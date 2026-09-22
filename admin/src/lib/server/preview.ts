import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import rehypeYouTubeEmbeds from '../../../../src/lib/rehype-youtube-embeds';
import { HttpError } from './http-guard';

export type PreviewPayload = Readonly<{
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  durationMinutes: number;
  position: number;
  format: 'written' | 'video';
  body: string;
  youtubeVideoId?: string;
}>;

const maximumMarkdownBytes = 500_000;
const processor = createMarkdownProcessor({ gfm: true, rehypePlugins: [rehypeYouTubeEmbeds] });
const noteContentStyles = readFile(fileURLToPath(new URL('../../../../public/note-content.css', import.meta.url)), 'utf8');

const escapeHtml = (value: string): string => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const sanitizeFragment = (value: string): string => value
  .replace(/<(script|style|form|button|object|embed|meta|link)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/<(script|style|form|button|object|embed|meta|link)\b[^>]*\/?\s*>/gi, '')
  .replace(/<input\b[^>]*>/gi, (input) => /\btype\s*=\s*(?:"checkbox"|'checkbox'|checkbox\b)/i.test(input)
    ? `<input type="checkbox" disabled${/\bchecked\b/i.test(input) ? ' checked' : ''}>`
    : '')
  .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, '$1="#"');

const addPreviewCodeControls = (value: string): string => value.replace(
  /(<pre\b[^>]*>\s*<code\b[^>]*>[\s\S]*?<\/code>\s*<\/pre>)/gi,
  '<div class="code-block"><span class="code-copy-button" aria-hidden="true">Copiar</span>$1</div>',
);

const validatePreview = (payload: PreviewPayload): void => {
  if (!payload || typeof payload !== 'object') throw new HttpError(400, 'validation_failed', 'Revisa los datos de la vista previa.');
  if (typeof payload.title !== 'string' || typeof payload.description !== 'string' || !Array.isArray(payload.tags)) {
    throw new HttpError(400, 'validation_failed', 'Completa los metadatos antes de previsualizar.');
  }
  if (!Number.isInteger(payload.position) || payload.position < 1 || !Number.isInteger(payload.durationMinutes) || payload.durationMinutes < 1) {
    throw new HttpError(400, 'validation_failed', 'Revisa la posición y la duración antes de previsualizar.');
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
  const [markdownProcessor, styles] = await Promise.all([processor, noteContentStyles]);
  const rendered = await markdownProcessor.render(markdown);
  const content = addPreviewCodeControls(sanitizeFragment(rendered.code));
  const body = payload.format === 'written'
    ? `<div class="note-prose note-content-body">${content}</div>`
    : `<section class="note-video-section" aria-label="Video: ${escapeHtml(payload.title)}">${content}</section>`;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob: http://127.0.0.1; frame-src https://www.youtube.com https://www.youtube-nocookie.com; style-src 'unsafe-inline'"><meta name="viewport" content="width=device-width"><style>${styles}</style></head><body class="note-preview"><main class="note-preview-shell"><article class="note-content" aria-labelledby="note-title"><p class="eyebrow">Clase ${escapeHtml(String(payload.position))} · ${escapeHtml(String(payload.durationMinutes))} minutos</p><h1 id="note-title" class="note-content-title">${escapeHtml(payload.title)}</h1><p class="note-content-description">${escapeHtml(payload.description)}</p>${body}</article></main></body></html>`;
};
