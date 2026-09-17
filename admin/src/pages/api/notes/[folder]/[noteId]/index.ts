import type { APIRoute } from 'astro';
import type { NoteMutationInput } from '../../../../../lib/contracts';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../../lib/server/mutation-coordinator';
import { updateNote } from '../../../../../lib/server/note-mutations';
import { repositoryRoot } from '../../../../../lib/server/repository-root';

export const prerender = false;

export const handleNoteRequest = async (request: Request, root: string, folder: string, noteId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const input = await readJson<NoteMutationInput & { revision: string }>(request, 700_000);
    const result = await mutationCoordinatorFor(root).run(() => updateNote(root, folder, noteId, input.revision, input));
    return jsonSuccess(result.note, { message: 'Nota actualizada.', changedPaths: result.changedPaths });
  } catch (error) { return errorResponse(error); }
};

export const PUT: APIRoute = ({ request, params }) => handleNoteRequest(request, repositoryRoot, params.folder ?? '', params.noteId ?? '');
