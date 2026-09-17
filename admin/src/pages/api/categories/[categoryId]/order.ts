import type { APIRoute } from 'astro';
import { assertLocalRequest, errorResponse, jsonSuccess, readJson } from '../../../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../../../lib/server/mutation-coordinator';
import { saveCategoryOrder, type OrderMutationInput } from '../../../../lib/server/order-mutations';
import { repositoryRoot } from '../../../../lib/server/repository-root';

export const prerender = false;

export const handleOrderRequest = async (request: Request, root: string, categoryId: string): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    const input = await readJson<OrderMutationInput>(request);
    const result = await mutationCoordinatorFor(root).run(() => saveCategoryOrder(root, categoryId, input));
    return jsonSuccess(result.items, { message: 'Orden guardado.', changedPaths: result.changedPaths });
  } catch (error) { return errorResponse(error); }
};

export const POST: APIRoute = ({ request, params }) => handleOrderRequest(request, repositoryRoot, params.categoryId ?? '');
