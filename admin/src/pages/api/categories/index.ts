import type { APIRoute } from 'astro';
import type { CategoryMutationInput } from '../../../lib/contracts';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../lib/server/repository-root';
import { createCategory } from '../../../lib/server/structure-mutations';

export const prerender = false;

export const handleCategoriesRequest = async (request: Request, root = repositoryRoot): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const input = await readJson<CategoryMutationInput>(request);
    const category = await mutationCoordinatorFor(root).run(() => createCategory(root, input));
    return jsonSuccess(category, { status: 201, message: 'Categoría creada.', changedPaths: [category.sourcePath] });
  } catch (error) { return errorResponse(error); }
};

export const POST: APIRoute = ({ request }) => handleCategoriesRequest(request);
