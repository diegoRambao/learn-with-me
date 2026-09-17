import type { APIRoute } from 'astro';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../lib/server/http-guard';
import { renderNotePreview, type PreviewPayload } from '../../lib/server/preview';

export const prerender = false;

export const handlePreviewRequest = async (request: Request): Promise<Response> => {
  try {
    assertLocalRequest(request);
    const payload = await readJson<PreviewPayload>(request, 560_000);
    return jsonSuccess({ html: await renderNotePreview(payload) });
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST: APIRoute = ({ request }) => handlePreviewRequest(request);
