import type { APIRoute } from 'astro';
import { errorResponse, jsonSuccess } from '../../../lib/server/http-guard';
import { repositoryRoot } from '../../../lib/server/repository-root';
import { listTrashEntries } from '../../../lib/server/trash';

export const prerender = false;
export const handleTrashCollectionRequest = async (_request: Request, root = repositoryRoot): Promise<Response> => {
  try { return jsonSuccess(await listTrashEntries(root)); } catch (error) { return errorResponse(error); }
};
export const GET: APIRoute = ({ request }) => handleTrashCollectionRequest(request);
