import type { ApiErrorBody, ApiSuccess, BootstrapData, CategoryDocument, CategoryMutationInput, ManagedAsset, NoteDocument, NoteMutationInput, OrderItem, TopicMutationInput } from '../contracts';
import type { PreviewPayload } from '../server/preview';

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly body: ApiErrorBody,
  ) { super(message); }
}

const responseData = async <T>(response: Response): Promise<ApiSuccess<T>> => {
  const body = await response.json() as ApiSuccess<T> | ApiErrorBody;
  if (!response.ok) {
    const failure = body as ApiErrorBody;
    throw new AdminApiError(response.status, failure.error.code, failure.error.message, failure);
  }
  return body as ApiSuccess<T>;
};

export const createAdminApi = (initialToken = '') => {
  let token = initialToken;
  const headers = (): HeadersInit => ({ 'content-type': 'application/json', ...(token ? { 'x-content-admin-token': token } : {}) });
  const mutate = async <T>(url: string, method: string, payload: unknown): Promise<ApiSuccess<T>> =>
    responseData<T>(await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) }));
  return {
    bootstrap: async (): Promise<BootstrapData> => {
      const result = await responseData<BootstrapData>(await fetch('/api/bootstrap'));
      token = result.data.csrfToken;
      return result.data;
    },
    preview: async (payload: PreviewPayload): Promise<string> => (await responseData<{ html: string }>(await fetch('/api/preview', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }))).data.html,
    upload: async (file: File): Promise<Omit<ManagedAsset, 'originalName' | 'stagedPath' | 'destinationPath' | 'createdAt'>> => {
      const body = new FormData();
      body.append('image', file);
      return (await responseData<Omit<ManagedAsset, 'originalName' | 'stagedPath' | 'destinationPath' | 'createdAt'>>(await fetch('/api/uploads', { method: 'POST', headers: { 'x-content-admin-token': token }, body }))).data;
    },
    createNote: async (payload: NoteMutationInput): Promise<ApiSuccess<NoteDocument>> => responseData(await fetch('/api/notes', { method: 'POST', headers: headers(), body: JSON.stringify(payload) })),
    updateNote: (folder: string, id: string, revision: string, payload: NoteMutationInput): Promise<ApiSuccess<NoteDocument>> => mutate(`/api/notes/${folder}/${id}`, 'PUT', { ...payload, revision }),
    trashNote: (folder: string, id: string, revision: string): Promise<ApiSuccess<import('../contracts').TrashSummary>> => mutate(`/api/notes/${folder}/${id}/trash`, 'POST', { revision }),
    restoreTrash: (trashId: string, manifestRevision: string): Promise<ApiSuccess<Record<string, never>>> => mutate(`/api/trash/${trashId}/restore`, 'POST', { manifestRevision }),
    purgeTrash: async (trashId: string, manifestRevision: string, confirmTrashId: string): Promise<void> => {
      const response = await fetch(`/api/trash/${trashId}`, { method: 'DELETE', headers: headers(), body: JSON.stringify({ manifestRevision, confirmTrashId }) });
      if (!response.ok) await responseData(response);
    },
    createCategory: (payload: CategoryMutationInput): Promise<ApiSuccess<CategoryDocument>> => mutate('/api/categories', 'POST', payload),
    updateCategory: (id: string, revision: string, payload: CategoryMutationInput): Promise<ApiSuccess<CategoryDocument>> => mutate(`/api/categories/${id}`, 'PUT', { ...payload, revision }),
    deleteCategory: (id: string, revision: string, confirmCategoryId: string): Promise<ApiSuccess<Record<string, never>>> => mutate(`/api/categories/${id}`, 'DELETE', { revision, confirmCategoryId }),
    createTopic: (categoryId: string, categoryRevision: string, payload: TopicMutationInput): Promise<ApiSuccess<CategoryDocument>> => mutate(`/api/categories/${categoryId}/topics`, 'POST', { ...payload, categoryRevision }),
    updateTopic: (categoryId: string, topicId: string, categoryRevision: string, name: string): Promise<ApiSuccess<CategoryDocument>> => mutate(`/api/categories/${categoryId}/topics/${topicId}`, 'PUT', { categoryRevision, name }),
    deleteTopic: (categoryId: string, topicId: string, categoryRevision: string): Promise<ApiSuccess<CategoryDocument>> => mutate(`/api/categories/${categoryId}/topics/${topicId}`, 'DELETE', { categoryRevision }),
    saveOrder: (categoryId: string, payload: unknown): Promise<ApiSuccess<ReadonlyArray<OrderItem>>> => mutate(`/api/categories/${categoryId}/order`, 'POST', payload),
    setToken: (value: string): void => { token = value; },
  };
};
