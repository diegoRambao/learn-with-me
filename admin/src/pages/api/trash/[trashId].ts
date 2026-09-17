import type { APIRoute } from 'astro';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../lib/server/repository-root';
import { purgeTrashEntry, restoreTrashEntry } from '../../../lib/server/trash';

export const prerender = false;
export const handleTrashEntryRequest = async (request: Request, root: string, trashId: string, action: 'restore' | 'purge'): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    if (action === 'restore') {
      const { manifestRevision } = await readJson<{ manifestRevision: string }>(request);
      const changedPaths = await mutationCoordinatorFor(root).run(() => restoreTrashEntry(root, trashId, manifestRevision));
      return jsonSuccess({}, { message: 'Nota restaurada.', changedPaths });
    }
    const { manifestRevision, confirmTrashId } = await readJson<{ manifestRevision: string; confirmTrashId: string }>(request);
    await mutationCoordinatorFor(root).run(() => purgeTrashEntry(root, trashId, manifestRevision, confirmTrashId));
    return new Response(null, { status: 204 });
  } catch (error) { return errorResponse(error); }
};
export const POST: APIRoute = ({ request, params }) => handleTrashEntryRequest(request, repositoryRoot, params.trashId ?? '', 'restore');
export const DELETE: APIRoute = ({ request, params }) => handleTrashEntryRequest(request, repositoryRoot, params.trashId ?? '', 'purge');
