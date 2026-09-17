import { defineMiddleware } from 'astro:middleware';
import { assertLocalRequest, errorResponse, noStoreHeaders } from './lib/server/http-guard';

const requiresToken = (request: Request): boolean => {
  const { pathname } = new URL(request.url);
  if (!pathname.startsWith('/api/')) return false;
  if (request.method === 'GET' || request.method === 'HEAD' || request.method === 'OPTIONS') return false;
  return pathname !== '/api/preview';
};

export const guardAdminRequest = async (request: Request, next: () => Promise<Response>): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: requiresToken(request) });
    const response = await next();
    const headers = new Headers(response.headers);
    for (const [name, value] of Object.entries(noStoreHeaders)) headers.set(name, value);
    headers.delete('access-control-allow-origin');
    headers.delete('access-control-allow-credentials');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    return errorResponse(error);
  }
};

export const onRequest = defineMiddleware(({ request }, next) => guardAdminRequest(request, next));
