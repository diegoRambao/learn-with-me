import type { APIRoute } from 'astro';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../../../lib/server/repository-root';
import { moveNoteToTrash } from '../../../../../lib/server/trash';

export const prerender = false;
export const handleTrashNoteRequest = async (request: Request, root: string, folder: string, noteId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const { revision } = await readJson<{ revision: string }>(request);
    const entry = await mutationCoordinatorFor(root).run(() => moveNoteToTrash(root, folder, noteId, revision));
    return jsonSuccess(entry, { message: 'Nota movida a la papelera.', changedPaths: [entry.originalPath, `.content-admin/trash/notes/${entry.trashId}`] });
  } catch (error) { return errorResponse(error); }
};
export const POST: APIRoute = ({ request, params }) => handleTrashNoteRequest(request, repositoryRoot, params.folder ?? '', params.noteId ?? '');
