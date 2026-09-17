import type { BootstrapData, CategoryDocument, CategoryMutationInput, TopicMutationInput } from '../contracts';
import { createAdminApi } from './admin-api';

const element = <T extends Element>(selector: string): T => document.querySelector<T>(selector) as T;
const api = createAdminApi();
const status = element<HTMLElement>('#admin-status');
const categoryForm = element<HTMLFormElement>('#category-form');
const categoryExisting = element<HTMLSelectElement>('#category-existing');
const topicForm = element<HTMLFormElement>('#topic-form');
const topicCategory = element<HTMLSelectElement>('#topic-category');
const topicExisting = element<HTMLSelectElement>('#topic-existing');

let data: BootstrapData;
let categoryIdWasEdited = false;
let topicIdWasEdited = false;

const slugFromName = (value: string): string => value
  .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const categoryById = (id: string): CategoryDocument | undefined => data.snapshot.categories.find((category) => category.id === id);
const refresh = async (): Promise<void> => {
  data = await api.bootstrap();
  const selectedCategory = categoryExisting.value;
  const selectedTopicCategory = topicCategory.value;
  categoryExisting.replaceChildren(new Option('Nueva categoría', ''));
  topicCategory.replaceChildren(new Option('Selecciona…', ''));
  for (const category of data.snapshot.categories) {
    categoryExisting.add(new Option(category.name, category.id));
    topicCategory.add(new Option(category.name, category.id));
  }
  categoryExisting.value = [...categoryExisting.options].some(({ value }) => value === selectedCategory) ? selectedCategory : '';
  topicCategory.value = [...topicCategory.options].some(({ value }) => value === selectedTopicCategory) ? selectedTopicCategory : '';
  renderTopicOptions();
};

const fillCategory = (): void => {
  const category = categoryById(categoryExisting.value);
  const fields = categoryForm.elements;
  (fields.namedItem('id') as HTMLInputElement).value = category?.id ?? '';
  (fields.namedItem('id') as HTMLInputElement).disabled = Boolean(category);
  (fields.namedItem('name') as HTMLInputElement).value = category?.name ?? '';
  (fields.namedItem('description') as HTMLTextAreaElement).value = category?.description ?? '';
  (fields.namedItem('image') as HTMLInputElement).value = category?.image ?? '/images/categories/';
  (fields.namedItem('level') as HTMLSelectElement).value = category?.level ?? 'beginner';
  element<HTMLButtonElement>('#delete-category').hidden = !category;
  categoryIdWasEdited = Boolean(category);
};

const renderTopicOptions = (): void => {
  const category = categoryById(topicCategory.value);
  topicExisting.replaceChildren(new Option('Nuevo tema', ''));
  for (const topic of category?.topics ?? []) topicExisting.add(new Option(topic.name, topic.id));
  fillTopic();
};

const fillTopic = (): void => {
  const category = categoryById(topicCategory.value);
  const topic = category?.topics.find(({ id }) => id === topicExisting.value);
  const fields = topicForm.elements;
  (fields.namedItem('id') as HTMLInputElement).value = topic?.id ?? '';
  (fields.namedItem('id') as HTMLInputElement).disabled = Boolean(topic);
  (fields.namedItem('name') as HTMLInputElement).value = topic?.name ?? '';
  (fields.namedItem('position') as HTMLInputElement).value = String(topic?.position ?? 1);
  (fields.namedItem('position') as HTMLInputElement).disabled = Boolean(topic);
  element<HTMLButtonElement>('#delete-topic').hidden = !topic;
  topicIdWasEdited = Boolean(topic);
};

categoryExisting.addEventListener('change', fillCategory);
topicCategory.addEventListener('change', renderTopicOptions);
topicExisting.addEventListener('change', fillTopic);
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
  const fields = categoryForm.elements;
  const existing = categoryById(categoryExisting.value);
  const input: CategoryMutationInput = {
    id: existing?.id ?? (fields.namedItem('id') as HTMLInputElement).value,
    name: (fields.namedItem('name') as HTMLInputElement).value,
    description: (fields.namedItem('description') as HTMLTextAreaElement).value,
    image: (fields.namedItem('image') as HTMLInputElement).value,
    level: (fields.namedItem('level') as HTMLSelectElement).value as CategoryMutationInput['level'],
  };
  try {
    const result = existing ? await api.updateCategory(existing.id, existing.revision, input) : await api.createCategory(input);
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    categoryExisting.value = result.data.id;
    await refresh();
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo guardar la categoría.'; }
});

topicForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const category = categoryById(topicCategory.value);
  if (!category) return;
  const fields = topicForm.elements;
  const existing = category.topics.find(({ id }) => id === topicExisting.value);
  const input: TopicMutationInput = {
    id: existing?.id ?? (fields.namedItem('id') as HTMLInputElement).value,
    name: (fields.namedItem('name') as HTMLInputElement).value,
    position: Number((fields.namedItem('position') as HTMLInputElement).value),
  };
  try {
    const result = existing
      ? await api.updateTopic(category.id, existing.id, category.revision, input.name)
      : await api.createTopic(category.id, category.revision, input);
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    topicExisting.value = input.id;
    await refresh();
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo guardar el tema.'; }
});

element<HTMLButtonElement>('#delete-category').addEventListener('click', async () => {
  const category = categoryById(categoryExisting.value);
  if (!category || !confirm(`Eliminar la categoría “${category.name}”? Escribe su ID en el siguiente paso.`)) return;
  const confirmation = prompt('ID exacto de la categoría', '') ?? '';
  try {
    const result = await api.deleteCategory(category.id, category.revision, confirmation);
    status.textContent = result.message ?? 'Categoría eliminada.';
    categoryExisting.value = '';
    await refresh(); fillCategory(); window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo eliminar la categoría.'; }
});

element<HTMLButtonElement>('#delete-topic').addEventListener('click', async () => {
  const category = categoryById(topicCategory.value);
  const topic = category?.topics.find(({ id }) => id === topicExisting.value);
  if (!category || !topic || !confirm(`Eliminar el tema “${topic.name}”?`)) return;
  try {
    const result = await api.deleteTopic(category.id, topic.id, category.revision);
    status.textContent = result.message ?? 'Tema eliminado.';
    await refresh(); window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo eliminar el tema.'; }
});

window.addEventListener('content-admin:category-selected', (event) => {
  const categoryId = (event as CustomEvent<{ categoryId: string }>).detail.categoryId;
  categoryExisting.value = categoryId;
  topicCategory.value = categoryId;
  fillCategory();
  renderTopicOptions();
});

window.addEventListener('content-admin:new-category', () => {
  categoryExisting.value = '';
  categoryIdWasEdited = false;
  fillCategory();
  (categoryForm.elements.namedItem('name') as HTMLInputElement).focus();
});

window.addEventListener('content-admin:new-topic', (event) => {
  const categoryId = (event as CustomEvent<{ categoryId: string }>).detail.categoryId;
  topicCategory.value = categoryId;
  renderTopicOptions();
  topicExisting.value = '';
  topicIdWasEdited = false;
  fillTopic();
  const category = categoryById(categoryId);
  const notePositions = data.snapshot.notes.filter(({ category: noteCategory }) => noteCategory === categoryId).map(({ position }) => position);
  const topicPositions = category?.topics.map(({ position }) => position) ?? [];
  (topicForm.elements.namedItem('position') as HTMLInputElement).value = String(Math.max(0, ...topicPositions, ...notePositions) + 1);
  (topicForm.elements.namedItem('name') as HTMLInputElement).focus();
});

refresh().then(fillCategory).catch((error) => { status.textContent = error instanceof Error ? error.message : 'No se pudo cargar la estructura.'; });
