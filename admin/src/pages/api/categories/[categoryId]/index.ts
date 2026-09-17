import type { APIRoute } from 'astro';
import type { CategoryMutationInput } from '../../../../lib/contracts';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../../../lib/server/repository-root';
import { deleteCategory, updateCategory } from '../../../../lib/server/structure-mutations';

export const prerender = false;

export const handleCategoryRequest = async (request: Request, root: string, categoryId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    if (request.method === 'PUT') {
      const input = await readJson<Omit<CategoryMutationInput, 'id' | 'topics'> & { revision: string }>(request);
      const category = await mutationCoordinatorFor(root).run(() => updateCategory(root, categoryId, input.revision, input));
      return jsonSuccess(category, { message: 'Categoría actualizada.', changedPaths: [category.sourcePath] });
    }
    if (request.method === 'DELETE') {
      const input = await readJson<{ revision: string; confirmCategoryId: string }>(request);
      const changedPaths = await mutationCoordinatorFor(root).run(() => deleteCategory(root, categoryId, input.revision, input.confirmCategoryId));
      return jsonSuccess({}, { message: 'Categoría eliminada.', changedPaths });
    }
    throw new Response(null, { status: 405 });
  } catch (error) {
    if (error instanceof Response) return error;
    return errorResponse(error);
  }
};

export const PUT: APIRoute = ({ request, params }) => handleCategoryRequest(request, repositoryRoot, params.categoryId ?? '');
export const DELETE: APIRoute = ({ request, params }) => handleCategoryRequest(request, repositoryRoot, params.categoryId ?? '');
