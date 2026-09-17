import type { APIRoute } from 'astro';
import type { BootstrapData } from '../../lib/contracts';
import { loadContentRepository } from '../../lib/server/content-repository';
import { errorResponse, getProcessCsrfToken, jsonSuccess, noStoreHeaders } from '../../lib/server/http-guard';
import { mutationCoordinatorFor } from '../../lib/server/mutation-coordinator';
import { repositoryRoot } from '../../lib/server/repository-root';
import { listTrashEntries } from '../../lib/server/trash';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    await mutationCoordinatorFor(repositoryRoot).initialize();
    const data: BootstrapData = {
      snapshot: await loadContentRepository(repositoryRoot),
      trash: await listTrashEntries(repositoryRoot),
      capabilities: { createCategories: true, createTopics: true, createNotes: true, uploads: true, trash: true },
      csrfToken: getProcessCsrfToken(),
    };
    return jsonSuccess(data, { headers: noStoreHeaders });
  } catch (error) {
    return errorResponse(error);
  }
};
