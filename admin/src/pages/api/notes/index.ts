import type { APIRoute } from 'astro';
import type { NoteMutationInput } from '../../../lib/contracts';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../lib/server/mutation-coordinator';
import { createNote } from '../../../lib/server/note-mutations';
import { repositoryRoot } from '../../../lib/server/repository-root';

export const prerender = false;

export const handleCreateNoteRequest = async (request: Request, root = repositoryRoot): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const input = await readJson<NoteMutationInput>(request, 700_000);
    const result = await mutationCoordinatorFor(root).run(() => createNote(root, input));
    return jsonSuccess(result.note, { status: 201, message: 'Nota guardada.', changedPaths: result.changedPaths });
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST: APIRoute = ({ request }) => handleCreateNoteRequest(request);
