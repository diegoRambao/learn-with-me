import type { APIRoute } from 'astro';
import { handleTrashEntryRequest } from '../[trashId]';
import { repositoryRoot } from '../../../../lib/server/repository-root';

export const prerender = false;
export const POST: APIRoute = ({ request, params }) => handleTrashEntryRequest(request, repositoryRoot, params.trashId ?? '', 'restore');
