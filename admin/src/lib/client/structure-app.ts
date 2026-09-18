import type { BootstrapData, CategoryDocument, CategoryMutationInput, Topic, TopicMutationInput } from '../contracts';
import { AdminApiError, createAdminApi } from './admin-api';

const required = <T extends Element>(selector: string): T => {
  const target = document.querySelector<T>(selector);
  if (!target) throw new Error(`No se encontró ${selector}`);
  return target;
};

const api = createAdminApi();
const status = required<HTMLElement>('#admin-status');
const categoryDialog = required<HTMLDialogElement>('#category-dialog');
const categoryForm = required<HTMLFormElement>('#category-form');
const categoryTitle = required<HTMLElement>('#category-dialog-title');
const categorySave = required<HTMLButtonElement>('#save-category');
const categoryError = required<HTMLElement>('#category-form-error');
const topicDialog = required<HTMLDialogElement>('#topic-dialog');
const topicForm = required<HTMLFormElement>('#topic-form');
const topicTitle = required<HTMLElement>('#topic-dialog-title');
const topicSave = required<HTMLButtonElement>('#save-topic');
const topicError = required<HTMLElement>('#topic-form-error');
const topicCategoryName = required<HTMLElement>('#topic-category-name');
const deleteCategoryDialog = required<HTMLDialogElement>('#delete-category-dialog');
const deleteCategoryForm = required<HTMLFormElement>('#delete-category-form');
const deleteCategoryError = required<HTMLElement>('#delete-category-error');
const confirmCategoryId = required<HTMLInputElement>('#confirm-category-id');
const confirmDeleteCategory = required<HTMLButtonElement>('#confirm-delete-category');
const deleteTopicDialog = required<HTMLDialogElement>('#delete-topic-dialog');
const deleteTopicForm = required<HTMLFormElement>('#delete-topic-form');
const deleteTopicError = required<HTMLElement>('#delete-topic-error');

let data: BootstrapData;
let editingCategoryId = '';
let editingTopicCategoryId = '';
let editingTopicId = '';
let deletingCategory: CategoryDocument | undefined;
let deletingTopic: Topic | undefined;
let categoryIdWasEdited = false;
let topicIdWasEdited = false;

const slugFromName = (value: string): string => value
  .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const categoryById = (id: string): CategoryDocument | undefined =>
  data.snapshot.categories.find((category) => category.id === id);

const topicById = (categoryId: string, topicId: string): Topic | undefined =>
  categoryById(categoryId)?.topics.find((topic) => topic.id === topicId);

const clearError = (target: HTMLElement): void => {
  target.hidden = true;
  target.replaceChildren();
};

const showError = (target: HTMLElement, error: unknown, fallback: string): void => {
  const message = error instanceof Error ? error.message : fallback;
  const paragraph = document.createElement('p');
  paragraph.textContent = message;
  target.replaceChildren(paragraph);
  if (error instanceof AdminApiError && error.body.error.details?.length) {
    const intro = document.createElement('p');
    intro.textContent = 'Elementos relacionados:';
    const list = document.createElement('ul');
    list.replaceChildren(...error.body.error.details.map((detail) => {
      const item = document.createElement('li');
      item.textContent = detail;
      return item;
    }));
    target.append(intro, list);
  }
  target.hidden = false;
  target.tabIndex = -1;
  target.focus();
};

const refresh = async (): Promise<void> => {
  data = await api.bootstrap();
};

const announceRefresh = (kind: 'category' | 'topic' | 'new-category' | 'new-topic', id = ''): void => {
  window.dispatchEvent(new CustomEvent('content-admin:refresh', { detail: { focus: { kind, id } } }));
};

const openCategoryDialog = (categoryId = ''): void => {
  const category = categoryById(categoryId);
  editingCategoryId = category?.id ?? '';
  categoryIdWasEdited = Boolean(category);
  categoryForm.reset();
  clearError(categoryError);
  categoryTitle.textContent = category ? 'Editar categoría' : 'Nueva categoría';
  categorySave.textContent = category ? 'Guardar categoría' : 'Crear categoría';
  const fields = categoryForm.elements;
  const id = fields.namedItem('id') as HTMLInputElement;
  id.value = category?.id ?? '';
  id.disabled = Boolean(category);
  (fields.namedItem('name') as HTMLInputElement).value = category?.name ?? '';
  (fields.namedItem('description') as HTMLTextAreaElement).value = category?.description ?? '';
  (fields.namedItem('image') as HTMLInputElement).value = category?.image ?? '/images/categories/';
  (fields.namedItem('level') as HTMLSelectElement).value = category?.level ?? 'beginner';
  categoryDialog.showModal();
  (fields.namedItem('name') as HTMLInputElement).focus();
};

const nextPosition = (category: CategoryDocument): number => {
  const topicPositions = category.topics.map(({ position }) => position);
  const notePositions = data.snapshot.notes
    .filter(({ category: noteCategory }) => noteCategory === category.id)
    .map(({ position }) => position);
  return Math.max(0, ...topicPositions, ...notePositions) + 1;
};

const openTopicDialog = (categoryId: string, topicId = ''): void => {
  const category = categoryById(categoryId);
  if (!category) return;
  const topic = topicById(categoryId, topicId);
  editingTopicCategoryId = category.id;
  editingTopicId = topic?.id ?? '';
  topicIdWasEdited = Boolean(topic);
  topicForm.reset();
  clearError(topicError);
  topicTitle.textContent = topic ? 'Editar tema' : 'Nuevo tema';
  topicSave.textContent = topic ? 'Guardar tema' : 'Crear tema';
  topicCategoryName.textContent = category.name;
  const fields = topicForm.elements;
  const id = fields.namedItem('id') as HTMLInputElement;
  id.value = topic?.id ?? '';
  id.disabled = Boolean(topic);
  (fields.namedItem('name') as HTMLInputElement).value = topic?.name ?? '';
  topicDialog.showModal();
  (fields.namedItem('name') as HTMLInputElement).focus();
};

const openDeleteCategoryDialog = (categoryId: string): void => {
  deletingCategory = categoryById(categoryId);
  if (!deletingCategory) return;
  deleteCategoryForm.reset();
  clearError(deleteCategoryError);
  required<HTMLElement>('#delete-category-description').textContent = `“${deletingCategory.name}” dejará de estar disponible en el sitio.`;
  required<HTMLElement>('#category-id-to-confirm').textContent = deletingCategory.id;
  confirmDeleteCategory.disabled = true;
  deleteCategoryDialog.showModal();
  confirmCategoryId.focus();
};

const openDeleteTopicDialog = (categoryId: string, topicId: string): void => {
  deletingTopic = topicById(categoryId, topicId);
  editingTopicCategoryId = categoryId;
  if (!deletingTopic) return;
  clearError(deleteTopicError);
  required<HTMLElement>('#delete-topic-description').textContent = `Eliminarás el tema “${deletingTopic.name}”. Las notas relacionadas deben reasignarse primero.`;
  deleteTopicDialog.showModal();
  deleteTopicForm.querySelector<HTMLButtonElement>('button[type="submit"]')?.focus();
};

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-close-dialog]')) {
  button.addEventListener('click', () => button.closest('dialog')?.close());
}

(categoryForm.elements.namedItem('name') as HTMLInputElement).addEventListener('input', (event) => {
  if (!categoryIdWasEdited) (categoryForm.elements.namedItem('id') as HTMLInputElement).value = slugFromName((event.currentTarget as HTMLInputElement).value);
});
(categoryForm.elements.namedItem('id') as HTMLInputElement).addEventListener('input', () => { categoryIdWasEdited = true; });
(topicForm.elements.namedItem('name') as HTMLInputElement).addEventListener('input', (event) => {
  if (!topicIdWasEdited) (topicForm.elements.namedItem('id') as HTMLInputElement).value = slugFromName((event.currentTarget as HTMLInputElement).value);
});
(topicForm.elements.namedItem('id') as HTMLInputElement).addEventListener('input', () => { topicIdWasEdited = true; });

categoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!categoryForm.reportValidity()) return;
  clearError(categoryError);
  const fields = categoryForm.elements;
  const existing = categoryById(editingCategoryId);
  const input: CategoryMutationInput = {
    id: existing?.id ?? (fields.namedItem('id') as HTMLInputElement).value,
    name: (fields.namedItem('name') as HTMLInputElement).value.trim(),
    description: (fields.namedItem('description') as HTMLTextAreaElement).value.trim(),
    image: (fields.namedItem('image') as HTMLInputElement).value.trim(),
    level: (fields.namedItem('level') as HTMLSelectElement).value as CategoryMutationInput['level'],
  };
  categorySave.disabled = true;
  try {
    const result = existing
      ? await api.updateCategory(existing.id, existing.revision, input)
      : await api.createCategory(input);
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    categoryDialog.close();
    await refresh();
    announceRefresh('category', result.data.id);
  } catch (error) {
    showError(categoryError, error, 'No se pudo guardar la categoría.');
  } finally {
    categorySave.disabled = false;
  }
});

topicForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!topicForm.reportValidity()) return;
  clearError(topicError);
  const category = categoryById(editingTopicCategoryId);
  if (!category) return;
  const fields = topicForm.elements;
  const existing = topicById(category.id, editingTopicId);
  const input: TopicMutationInput = {
    id: existing?.id ?? (fields.namedItem('id') as HTMLInputElement).value,
    name: (fields.namedItem('name') as HTMLInputElement).value.trim(),
    position: existing?.position ?? nextPosition(category),
  };
  topicSave.disabled = true;
  try {
    const result = existing
      ? await api.updateTopic(category.id, existing.id, category.revision, input.name)
      : await api.createTopic(category.id, category.revision, input);
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    topicDialog.close();
    await refresh();
    announceRefresh('topic', input.id);
  } catch (error) {
    showError(topicError, error, 'No se pudo guardar el tema.');
  } finally {
    topicSave.disabled = false;
  }
});

confirmCategoryId.addEventListener('input', () => {
  confirmDeleteCategory.disabled = confirmCategoryId.value !== deletingCategory?.id;
});

deleteCategoryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!deletingCategory || confirmCategoryId.value !== deletingCategory.id) return;
  clearError(deleteCategoryError);
  confirmDeleteCategory.disabled = true;
  try {
    const result = await api.deleteCategory(deletingCategory.id, deletingCategory.revision, confirmCategoryId.value);
    status.textContent = result.message ?? 'Categoría eliminada.';
    deleteCategoryDialog.close();
    await refresh();
    announceRefresh('new-category');
  } catch (error) {
    showError(deleteCategoryError, error, 'No se pudo eliminar la categoría.');
  } finally {
    confirmDeleteCategory.disabled = confirmCategoryId.value !== deletingCategory?.id;
  }
});

deleteTopicForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!deletingTopic) return;
  clearError(deleteTopicError);
  const submit = deleteTopicForm.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (submit) submit.disabled = true;
  try {
    const category = categoryById(editingTopicCategoryId);
    if (!category) return;
    const result = await api.deleteTopic(category.id, deletingTopic.id, category.revision);
    status.textContent = result.message ?? 'Tema eliminado.';
    deleteTopicDialog.close();
    await refresh();
    announceRefresh('new-topic');
  } catch (error) {
    showError(deleteTopicError, error, 'No se pudo eliminar el tema.');
  } finally {
    if (submit) submit.disabled = false;
  }
});

window.addEventListener('content-admin:new-category', () => openCategoryDialog());
window.addEventListener('content-admin:edit-category', (event) => openCategoryDialog((event as CustomEvent<{ categoryId: string }>).detail.categoryId));
window.addEventListener('content-admin:delete-category', (event) => openDeleteCategoryDialog((event as CustomEvent<{ categoryId: string }>).detail.categoryId));
window.addEventListener('content-admin:new-topic', (event) => openTopicDialog((event as CustomEvent<{ categoryId: string }>).detail.categoryId));
window.addEventListener('content-admin:edit-topic', (event) => {
  const { categoryId, topicId } = (event as CustomEvent<{ categoryId: string; topicId: string }>).detail;
  openTopicDialog(categoryId, topicId);
});
window.addEventListener('content-admin:delete-topic', (event) => {
  const { categoryId, topicId } = (event as CustomEvent<{ categoryId: string; topicId: string }>).detail;
  openDeleteTopicDialog(categoryId, topicId);
});
window.addEventListener('content-admin:refresh', () => { refresh().catch(() => undefined); });

refresh().catch((error) => { status.textContent = error instanceof Error ? error.message : 'No se pudo cargar la estructura.'; });
