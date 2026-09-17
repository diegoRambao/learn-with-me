import type { APIRoute } from 'astro';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../../../lib/server/repository-root';
import { deleteTopic, updateTopic } from '../../../../../lib/server/structure-mutations';

export const prerender = false;

export const handleTopicRequest = async (request: Request, root: string, categoryId: string, topicId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    if (request.method === 'PUT') {
      const input = await readJson<{ categoryRevision: string; name: string }>(request);
      const category = await mutationCoordinatorFor(root).run(() => updateTopic(root, categoryId, topicId, input.categoryRevision, input.name));
      return jsonSuccess(category, { message: 'Tema actualizado.', changedPaths: [category.sourcePath] });
    }
    if (request.method === 'DELETE') {
      const input = await readJson<{ categoryRevision: string }>(request);
      const category = await mutationCoordinatorFor(root).run(() => deleteTopic(root, categoryId, topicId, input.categoryRevision));
      return jsonSuccess(category, { message: 'Tema eliminado.', changedPaths: [category.sourcePath] });
    }
    throw new Response(null, { status: 405 });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse(error);
  }
};

export const PUT: APIRoute = ({ request, params }) => handleTopicRequest(request, repositoryRoot, params.categoryId ?? '', params.topicId ?? '');
export const DELETE: APIRoute = ({ request, params }) => handleTopicRequest(request, repositoryRoot, params.categoryId ?? '', params.topicId ?? '');
