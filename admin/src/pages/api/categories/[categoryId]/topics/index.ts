import type { APIRoute } from 'astro';
import type { TopicMutationInput } from '../../../../../lib/contracts';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../../../lib/server/repository-root';
import { createTopic } from '../../../../../lib/server/structure-mutations';

export const prerender = false;

export const handleTopicsRequest = async (request: Request, root: string, categoryId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const input = await readJson<TopicMutationInput & { categoryRevision: string }>(request);
    const category = await mutationCoordinatorFor(root).run(() => createTopic(root, categoryId, input.categoryRevision, input));
    return jsonSuccess(category, { status: 201, message: 'Tema creado.', changedPaths: [category.sourcePath] });
  } catch (error) { return errorResponse(error); }
};

export const POST: APIRoute = ({ request, params }) => handleTopicsRequest(request, repositoryRoot, params.categoryId ?? '');
