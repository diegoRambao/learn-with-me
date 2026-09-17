import type { BootstrapData, CategoryDocument, NoteDocument, NoteMutationInput, OrderItem } from '../contracts';
import { createAdminApi, AdminApiError } from './admin-api';
import { applyMarkdownCommand, type MarkdownCommand } from './markdown-toolbar';
import { filterContent } from './content-filters';
import { createNoteDraft, updateNoteDraft, validateNoteDraft, type NoteDraft } from './note-draft';
import { createOrderDraft, orderItemKey, orderPayload, reorderOrderDraft } from './order-draft';
import { schedulePreviewRefresh } from './preview-timing';
import { createUnsavedChangesGuard } from './unsaved-changes';

const required = <T extends Element>(selector: string): T => {
  const target = document.querySelector<T>(selector);
  if (!target) throw new Error(`No se encontró ${selector}`);
  return target;
};

const api = createAdminApi();
const form = required<HTMLFormElement>('#note-form');
const titleInput = required<HTMLInputElement>('#note-title');
const idInput = required<HTMLInputElement>('#note-id');
const categorySelect = required<HTMLSelectElement>('#note-category');
const topicSelect = required<HTMLSelectElement>('#note-topic');
const formatSelect = required<HTMLSelectElement>('#note-format');
const bodyInput = required<HTMLTextAreaElement>('#note-body');
const videoFields = required<HTMLElement>('#video-fields');
const markdownFields = required<HTMLElement>('#markdown-fields');
const uploadFields = required<HTMLElement>('#image-upload-fields');
const previewFrame = required<HTMLIFrameElement>('#note-preview');
const previewStatus = required<HTMLElement>('#preview-status');
const saveButton = required<HTMLButtonElement>('#save-note');
const status = required<HTMLElement>('#admin-status');
const summary = required<HTMLElement>('#note-error-summary');
const dirtyBadge = required<HTMLElement>('#dirty-badge');
const categoryGrid = required<HTMLElement>('#category-grid');
const orderList = required<HTMLOListElement>('#order-items');
const orderAnnouncement = required<HTMLElement>('#order-announcement');
const orderActions = required<HTMLElement>('.order-actions');
const saveOrderButton = required<HTMLButtonElement>('#save-order');
const discardOrderButton = required<HTMLButtonElement>('#discard-order');
const activeCategoryName = required<HTMLInputElement>('#active-category-name');
const saveCategoryName = required<HTMLButtonElement>('#save-category-name');
const imageInput = required<HTMLInputElement>('#note-image');
const imageAlt = required<HTMLInputElement>('#image-alt');
const imagePreview = required<HTMLImageElement>('#image-local-preview');
const imageMeta = required<HTMLElement>('#image-meta');
const uploadPreview = required<HTMLElement>('.upload-preview');
const adminShell = required<HTMLElement>('.admin-shell');
const categoryWorkspace = required<HTMLElement>('.category-workspace');
const guard = createUnsavedChangesGuard(required<HTMLDialogElement>('#unsaved-dialog'));

let bootstrap: BootstrapData;
let draft: NoteDraft = createNoteDraft();
let currentCategoryId = '';
let activeNotePath = '';
let currentOrder: ReturnType<typeof createOrderDraft> | null = null;
let orderDirty = false;
let categoryNameDirty = false;
let previewTimer: number | undefined;
let idWasEdited = false;
let draggedKey = '';

const slugFromTitle = (value: string): string => value
  .normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const currentCategory = (): CategoryDocument | undefined =>
  bootstrap.snapshot.categories.find(({ id }) => id === currentCategoryId);

const noteForItem = (item: OrderItem): NoteDocument | undefined => item.kind === 'note'
  ? bootstrap.snapshot.notes.find(({ id, folder }) => id === item.id && folder === item.folder)
  : undefined;

const syncDirtyGuard = (): void => guard.setDirty(draft.dirty || orderDirty || categoryNameDirty);

const valuesFromForm = (): NoteDraft['values'] => {
  const data = new FormData(form);
  return {
    id: idInput.value,
    title: String(data.get('title') ?? ''),
    description: String(data.get('description') ?? ''),
    tags: String(data.get('tags') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
    category: String(data.get('category') ?? ''),
    topic: String(data.get('topic') ?? ''),
    durationMinutes: Number(data.get('durationMinutes')),
    position: Number(data.get('position')),
    format: String(data.get('format')) as 'written' | 'video',
    body: String(data.get('body') ?? ''),
    youtubeVideoId: String(data.get('youtubeVideoId') ?? ''),
    uploadTokens: draft.values.uploadTokens,
  };
};

const setFormValue = (name: string, value: string | number): void => {
  const control = form.elements.namedItem(name);
  if (control instanceof HTMLInputElement || control instanceof HTMLTextAreaElement || control instanceof HTMLSelectElement) control.value = String(value);
};

const updateTopics = (): void => {
  const selected = bootstrap.snapshot.categories.find(({ id }) => id === categorySelect.value);
  const previous = topicSelect.value;
  topicSelect.replaceChildren(new Option('Sin tema', ''));
  for (const topic of selected?.topics ?? []) topicSelect.add(new Option(topic.name, topic.id));
  if ([...topicSelect.options].some(({ value }) => value === previous)) topicSelect.value = previous;
};

const clearIssues = (): void => {
  for (const target of document.querySelectorAll<HTMLElement>('[data-error-for]')) target.textContent = '';
  for (const control of form.elements) if (control instanceof HTMLElement) control.removeAttribute('aria-invalid');
  summary.hidden = true;
  summary.querySelector('ul')?.replaceChildren();
};

const showIssues = (fieldIssues: Readonly<Record<string, ReadonlyArray<string>>>): void => {
  clearIssues();
  const list = summary.querySelector('ul');
  for (const [field, messages] of Object.entries(fieldIssues)) {
    document.querySelector<HTMLElement>(`[data-error-for="${field}"]`)?.replaceChildren(document.createTextNode(messages.join(' ')));
    const control = form.elements.namedItem(field);
    if (control instanceof HTMLElement) control.setAttribute('aria-invalid', 'true');
    for (const message of messages) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${control instanceof HTMLElement ? control.id : ''}`;
      link.textContent = message;
      item.append(link);
      list?.append(item);
    }
  }
  summary.hidden = Object.keys(fieldIssues).length === 0;
  if (!summary.hidden) {
    required<HTMLDetailsElement>('#note-settings').open = true;
    summary.focus();
  }
};

const previewPayload = () => ({
  title: draft.values.title,
  description: draft.values.description,
  tags: draft.values.tags,
  durationMinutes: draft.values.durationMinutes,
  format: draft.values.format,
  body: draft.values.body,
  ...(draft.values.format === 'video' ? { youtubeVideoId: draft.values.youtubeVideoId } : {}),
});

const refreshPreview = async (): Promise<void> => {
  previewStatus.textContent = 'Actualizando vista previa…';
  try {
    previewFrame.srcdoc = await api.preview(previewPayload());
    previewStatus.textContent = 'Vista previa actualizada.';
  } catch (error) {
    previewStatus.textContent = error instanceof Error ? error.message : 'No se pudo actualizar la vista previa.';
  }
};

const schedulePreview = (): void => {
  previewTimer = schedulePreviewRefresh(window, previewTimer, refreshPreview);
};

const syncDraft = (): void => {
  draft = updateNoteDraft(draft, valuesFromForm());
  dirtyBadge.hidden = !draft.dirty;
  syncDirtyGuard();
  schedulePreview();
};

const syncFormat = (): void => {
  const written = formatSelect.value === 'written';
  videoFields.hidden = written;
  markdownFields.hidden = !written;
  uploadFields.hidden = !written;
  bodyInput.required = written;
  required<HTMLInputElement>('#youtube-video-id').required = !written;
};

const showView = (view: 'editor' | 'preview'): void => {
  required<HTMLElement>('#note-workspace').hidden = view !== 'editor';
  required<HTMLElement>('#preview-workspace').hidden = view !== 'preview';
  required<HTMLButtonElement>('#show-editor').setAttribute('aria-pressed', String(view === 'editor'));
  required<HTMLButtonElement>('#show-preview').setAttribute('aria-pressed', String(view === 'preview'));
  categoryWorkspace.classList.add('show-editor');
  if (view === 'preview') refreshPreview().catch(() => undefined);
};

const showWorkspace = (workspace: 'note' | 'structure' | 'trash'): void => {
  for (const view of document.querySelectorAll<HTMLElement>('.content-panel > .workspace-view')) view.hidden = true;
  if (workspace === 'note') showView('editor');
  if (workspace === 'structure') required<HTMLElement>('#structure-workspace').hidden = false;
  if (workspace === 'trash') required<HTMLElement>('#trash-workspace').hidden = false;
  categoryWorkspace.classList.add('show-editor');
};

const resetNote = (): void => {
  form.reset();
  idInput.disabled = false;
  idWasEdited = false;
  activeNotePath = '';
  setFormValue('category', currentCategoryId);
  updateTopics();
  setFormValue('position', (currentOrder?.items.length ?? 0) + 1);
  syncFormat();
  draft = createNoteDraft(valuesFromForm());
  dirtyBadge.hidden = true;
  required<HTMLElement>('#note-form-heading').textContent = 'Nueva nota';
  required<HTMLButtonElement>('#trash-note').hidden = true;
  required<HTMLDetailsElement>('#note-settings').open = true;
  clearIssues();
  syncDirtyGuard();
  renderOutline();
};

const loadNote = (sourcePath: string): void => {
  const note = bootstrap.snapshot.notes.find((entry) => entry.sourcePath === sourcePath);
  if (!note) return;
  activeNotePath = sourcePath;
  currentCategoryId = note.category;
  setFormValue('id', note.id);
  setFormValue('title', note.title);
  setFormValue('description', note.description);
  setFormValue('tags', note.tags.join(', '));
  setFormValue('category', note.category);
  updateTopics();
  setFormValue('topic', note.topic ?? '');
  setFormValue('durationMinutes', note.durationMinutes);
  setFormValue('position', note.position);
  setFormValue('format', note.format);
  setFormValue('body', note.body);
  setFormValue('youtubeVideoId', note.format === 'video' ? note.youtubeVideoId : '');
  idInput.disabled = true;
  idWasEdited = true;
  syncFormat();
  draft = createNoteDraft(valuesFromForm(), { identity: { folder: note.folder, id: note.id }, baseRevision: note.revision });
  dirtyBadge.hidden = true;
  required<HTMLElement>('#note-form-heading').textContent = `Editar · ${note.title}`;
  required<HTMLButtonElement>('#trash-note').hidden = false;
  required<HTMLDetailsElement>('#note-settings').open = false;
  status.textContent = `Editando ${note.sourcePath}`;
  syncDirtyGuard();
  showView('editor');
  schedulePreview();
  renderOutline();
};

const renderCategories = (): void => {
  const query = required<HTMLInputElement>('#category-query').value.trim().toLocaleLowerCase('es');
  const categories = bootstrap.snapshot.categories.filter(({ name }) => name.toLocaleLowerCase('es').includes(query));
  categoryGrid.replaceChildren();
  if (categories.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'outline-empty';
    empty.textContent = bootstrap.snapshot.categories.length === 0 ? 'Crea tu primera categoría para comenzar.' : 'No hay categorías que coincidan.';
    categoryGrid.append(empty);
    return;
  }
  for (const category of categories) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-card';
    button.dataset.categoryId = category.id;
    button.setAttribute('aria-current', String(category.id === currentCategoryId));
    const name = document.createElement('strong');
    name.textContent = category.name;
    const count = document.createElement('span');
    const noteCount = bootstrap.snapshot.notes.filter(({ category: id }) => id === category.id).length;
    count.textContent = `${category.topics.length} temas · ${noteCount} notas`;
    button.append(name, count);
    button.addEventListener('click', () => selectCategory(category.id, button));
    categoryGrid.append(button);
  }
};

const activeFilters = (): boolean => {
  const data = new FormData(required<HTMLFormElement>('#content-filters'));
  return Boolean(String(data.get('query') ?? '') || String(data.get('topic') ?? '') || String(data.get('tag') ?? ''));
};

const visibleNotePaths = (): Set<string> => {
  const filters = new FormData(required<HTMLFormElement>('#content-filters'));
  return new Set(filterContent(bootstrap.snapshot.notes, {
    query: String(filters.get('query') ?? ''),
    category: currentCategoryId,
    topic: String(filters.get('topic') ?? ''),
    tag: String(filters.get('tag') ?? ''),
  }).map(({ sourcePath }) => sourcePath));
};

const rowButton = (label: string, action: () => void, disabled = false): HTMLButtonElement => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener('click', action);
  return button;
};

const syncOrderFromDom = (message: string, movedKey = ''): void => {
  if (!currentOrder) return;
  const ordered: OrderItem[] = [];
  for (const group of orderList.querySelectorAll<HTMLElement>('.topic-group')) {
    const topicId = group.dataset.topicId || null;
    if (topicId) {
      const topicItem = currentOrder.items.find((item) => item.kind === 'topic' && item.id === topicId);
      if (topicItem) ordered.push(topicItem);
    }
    for (const row of group.querySelectorAll<HTMLElement>('.note-order-row')) {
      const item = currentOrder.items.find((entry) => orderItemKey(entry) === row.dataset.orderKey);
      if (item?.kind === 'note') ordered.push({ ...item, topic: topicId });
    }
  }
  const reordered = reorderOrderDraft(currentOrder, ordered);
  if (reordered === currentOrder) return;
  currentOrder = reordered;
  orderDirty = true;
  const moved = movedKey ? currentOrder.items.find((item) => orderItemKey(item) === movedKey) : undefined;
  orderAnnouncement.textContent = moved ? `${message} Está ahora en la posición ${moved.position}.` : message;
  syncDirtyGuard();
  renderOutline();
};

const moveTopicGroup = (group: HTMLElement, direction: 'up' | 'down'): void => {
  const sibling = direction === 'up' ? group.previousElementSibling : group.nextElementSibling;
  if (!(sibling instanceof HTMLElement) || sibling.classList.contains('ungrouped-group')) return;
  if (direction === 'up') orderList.insertBefore(group, sibling);
  else orderList.insertBefore(sibling, group);
  syncOrderFromDom(`${group.dataset.topicLabel} cambió de posición.`, `topic:${group.dataset.topicId}`);
};

const moveNoteRow = (row: HTMLElement, direction: 'up' | 'down'): void => {
  const sibling = direction === 'up' ? row.previousElementSibling : row.nextElementSibling;
  if (!(sibling instanceof HTMLElement)) return;
  if (direction === 'up') row.parentElement?.insertBefore(row, sibling);
  else row.parentElement?.insertBefore(sibling, row);
  syncOrderFromDom(`${row.dataset.noteLabel} cambió de posición.`, row.dataset.orderKey);
};

const enableDropTarget = (target: HTMLElement, onDrop: () => void): void => {
  target.addEventListener('dragover', (event) => {
    if (!draggedKey || activeFilters()) return;
    event.preventDefault();
    target.classList.add('drag-over');
  });
  target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
  target.addEventListener('drop', (event) => {
    event.preventDefault();
    target.classList.remove('drag-over');
    onDrop();
  });
};

const createNoteRow = (item: Extract<OrderItem, { kind: 'note' }>, visible: Set<string>): HTMLLIElement => {
  const note = noteForItem(item);
  const row = document.createElement('li');
  row.className = 'note-order-row';
  row.dataset.orderKey = orderItemKey(item);
  row.dataset.noteLabel = item.label;
  row.draggable = !activeFilters();
  row.hidden = !note || !visible.has(note.sourcePath);
  const select = document.createElement('button');
  select.type = 'button';
  select.className = 'note-select';
  select.textContent = `Nota · ${item.label}`;
  select.setAttribute('aria-current', String(note?.sourcePath === activeNotePath));
  if (note) select.addEventListener('click', async () => { if (await guard.confirmNavigation(select)) loadNote(note.sourcePath); });
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  actions.append(rowButton('Subir', () => moveNoteRow(row, 'up')));
  actions.append(rowButton('Bajar', () => moveNoteRow(row, 'down')));
  const destination = document.createElement('select');
  destination.setAttribute('aria-label', `Mover ${item.label} a otro tema`);
  destination.add(new Option('Sin tema', ''));
  for (const topic of currentCategory()?.topics ?? []) destination.add(new Option(topic.name, topic.id));
  destination.value = item.topic ?? '';
  destination.addEventListener('change', () => {
    const target = orderList.querySelector<HTMLElement>(`.topic-group[data-topic-id="${CSS.escape(destination.value)}"]`)
      ?? orderList.querySelector<HTMLElement>('.ungrouped-group');
    target?.querySelector('.topic-notes')?.append(row);
    syncOrderFromDom(`${item.label} se movió a ${destination.selectedOptions[0]?.text ?? 'Sin tema'}.`, orderItemKey(item));
  });
  actions.append(destination);
  row.append(select, actions);
  row.addEventListener('dragstart', (event) => {
    draggedKey = orderItemKey(item);
    event.dataTransfer?.setData('text/plain', draggedKey);
    event.dataTransfer?.setDragImage(row, 12, 12);
  });
  row.addEventListener('dragend', () => { draggedKey = ''; document.querySelectorAll('.drag-over').forEach((target) => target.classList.remove('drag-over')); });
  enableDropTarget(row, () => {
    const dragged = orderList.querySelector<HTMLElement>(`.note-order-row[data-order-key="${CSS.escape(draggedKey)}"]`);
    if (!dragged || dragged === row) return;
    row.parentElement?.insertBefore(dragged, row);
    syncOrderFromDom(`${dragged.dataset.noteLabel} cambió de posición.`, dragged.dataset.orderKey);
  });
  return row;
};

const createTopicGroup = (
  topicItem: Extract<OrderItem, { kind: 'topic' }> | null,
  noteItems: ReadonlyArray<Extract<OrderItem, { kind: 'note' }>>,
  visible: Set<string>,
): HTMLLIElement => {
  const group = document.createElement('li');
  group.className = `topic-group${topicItem ? '' : ' ungrouped-group'}`;
  group.dataset.topicId = topicItem?.id ?? '';
  group.dataset.topicLabel = topicItem?.label ?? 'Sin tema';
  const heading = document.createElement('div');
  heading.className = 'topic-row';
  heading.draggable = Boolean(topicItem) && !activeFilters();
  const label = document.createElement('span');
  label.textContent = topicItem ? `Tema · ${topicItem.label}` : 'Sin tema';
  const actions = document.createElement('div');
  actions.className = 'row-actions';
  if (topicItem) {
    actions.append(rowButton('Subir', () => moveTopicGroup(group, 'up')));
    actions.append(rowButton('Bajar', () => moveTopicGroup(group, 'down')));
    heading.addEventListener('dragstart', (event) => {
      draggedKey = orderItemKey(topicItem);
      event.dataTransfer?.setData('text/plain', draggedKey);
    });
    heading.addEventListener('dragend', () => { draggedKey = ''; });
  }
  heading.append(label, actions);
  const notes = document.createElement('ol');
  notes.className = 'topic-notes';
  notes.replaceChildren(...noteItems.map((item) => createNoteRow(item, visible)));
  group.append(heading, notes);
  enableDropTarget(group, () => {
    if (draggedKey.startsWith('topic:') && topicItem) {
      const dragged = [...orderList.children].find((entry) => (entry as HTMLElement).dataset.topicId === draggedKey.slice('topic:'.length));
      if (dragged instanceof HTMLElement && dragged !== group) orderList.insertBefore(dragged, group);
    } else if (draggedKey.startsWith('note:')) {
      const dragged = orderList.querySelector<HTMLElement>(`.note-order-row[data-order-key="${CSS.escape(draggedKey)}"]`);
      if (dragged) notes.append(dragged);
    }
    syncOrderFromDom('El orden del contenido cambió.', draggedKey);
  });
  return group;
};

const renderOutline = (): void => {
  orderList.replaceChildren();
  const category = currentCategory();
  if (!category || !currentOrder) {
    const empty = document.createElement('li');
    empty.className = 'outline-empty';
    empty.textContent = 'Selecciona una categoría para ver su estructura.';
    orderList.append(empty);
    orderActions.hidden = true;
    return;
  }
  const visible = visibleNotePaths();
  const topicItems = currentOrder.items.filter((item): item is Extract<OrderItem, { kind: 'topic' }> => item.kind === 'topic');
  const noteItems = currentOrder.items.filter((item): item is Extract<OrderItem, { kind: 'note' }> => item.kind === 'note');
  for (const topic of topicItems) orderList.append(createTopicGroup(topic, noteItems.filter((note) => note.topic === topic.id), visible));
  orderList.append(createTopicGroup(null, noteItems.filter(({ topic }) => topic === null), visible));
  const visibleRows = orderList.querySelectorAll('.note-order-row:not([hidden])').length;
  if (visibleRows === 0 && bootstrap.snapshot.notes.some(({ category: id }) => id === category.id)) {
    const empty = document.createElement('li');
    empty.className = 'outline-empty';
    empty.textContent = 'No hay resultados. Conservamos tus filtros para que puedas ajustarlos.';
    orderList.append(empty);
  }
  orderActions.hidden = !orderDirty;
  saveOrderButton.disabled = !orderDirty;
  discardOrderButton.disabled = !orderDirty;
};

const updateCategoryHeader = (): void => {
  const category = currentCategory();
  activeCategoryName.disabled = !category;
  activeCategoryName.value = category?.name ?? '';
  saveCategoryName.hidden = true;
  categoryNameDirty = false;
  adminShell.classList.toggle('has-selection', Boolean(category));
};

const populateFilters = (): void => {
  const categoryFilter = required<HTMLSelectElement>('#filter-category');
  const topicFilter = required<HTMLSelectElement>('#filter-topic');
  const tagFilter = required<HTMLSelectElement>('#filter-tag');
  const orderCategory = required<HTMLSelectElement>('#order-category');
  const previous = { topic: topicFilter.value, tag: tagFilter.value };
  categoryFilter.replaceChildren(new Option('Todas', ''));
  orderCategory.replaceChildren(new Option('Selecciona…', ''));
  categorySelect.replaceChildren(new Option('Selecciona…', ''));
  topicFilter.replaceChildren(new Option('Todos', ''));
  tagFilter.replaceChildren(new Option('Todas', ''));
  required<HTMLDataListElement>('#existing-tags').replaceChildren();
  for (const category of bootstrap.snapshot.categories) {
    categoryFilter.add(new Option(category.name, category.id));
    orderCategory.add(new Option(category.name, category.id));
    categorySelect.add(new Option(category.name, category.id));
    if (category.id === currentCategoryId) for (const topic of category.topics) topicFilter.add(new Option(topic.name, topic.id));
  }
  for (const tag of bootstrap.snapshot.tags) {
    tagFilter.add(new Option(tag.value, tag.value));
    required<HTMLDataListElement>('#existing-tags').append(new Option(tag.value));
  }
  categoryFilter.value = currentCategoryId;
  orderCategory.value = currentCategoryId;
  topicFilter.value = [...topicFilter.options].some(({ value }) => value === previous.topic) ? previous.topic : '';
  tagFilter.value = [...tagFilter.options].some(({ value }) => value === previous.tag) ? previous.tag : '';
};

const renderIssues = (): void => {
  const issues = required<HTMLUListElement>('#content-issues');
  issues.replaceChildren(...bootstrap.snapshot.issues.map((issue) => {
    const item = document.createElement('li');
    item.textContent = `${issue.sourcePath} · ${issue.field}: ${issue.message}`;
    return item;
  }));
  required<HTMLElement>('#issue-count').textContent = bootstrap.snapshot.issues.length ? `(${bootstrap.snapshot.issues.length})` : '';
};

const selectCategory = async (categoryId: string, trigger: HTMLElement): Promise<void> => {
  syncDirtyGuard();
  if ((draft.dirty || orderDirty || categoryNameDirty) && !await guard.confirmNavigation(trigger)) return;
  currentCategoryId = categoryId;
  activeNotePath = '';
  currentOrder = createOrderDraft(currentCategory() as CategoryDocument, bootstrap.snapshot.notes);
  orderDirty = false;
  populateFilters();
  updateCategoryHeader();
  renderCategories();
  renderOutline();
  window.dispatchEvent(new CustomEvent('content-admin:category-selected', { detail: { categoryId } }));
  resetNote();
  status.textContent = `Categoría ${currentCategory()?.name ?? categoryId} seleccionada.`;
};

const initialize = async (announce = true): Promise<void> => {
  const previousCategory = currentCategoryId;
  bootstrap = await api.bootstrap();
  if (!bootstrap.snapshot.categories.some(({ id }) => id === previousCategory)) currentCategoryId = bootstrap.snapshot.categories[0]?.id ?? '';
  currentOrder = currentCategory() ? createOrderDraft(currentCategory() as CategoryDocument, bootstrap.snapshot.notes) : null;
  orderDirty = false;
  populateFilters();
  updateCategoryHeader();
  renderCategories();
  renderOutline();
  renderIssues();
  saveButton.disabled = bootstrap.snapshot.categories.length === 0;
  required<HTMLElement>('#empty-workspace').hidden = bootstrap.snapshot.categories.length > 0;
  if (announce) status.textContent = bootstrap.snapshot.categories.length === 0
    ? 'Crea una categoría antes de crear notas.'
    : 'Inventario listo. Selecciona contenido para editarlo o arrástralo para ordenar.';
};

titleInput.addEventListener('input', () => { if (!idWasEdited) idInput.value = slugFromTitle(titleInput.value); });
idInput.addEventListener('input', () => { idWasEdited = true; });
categorySelect.addEventListener('change', updateTopics);
formatSelect.addEventListener('change', () => {
  const discards = (formatSelect.value === 'video' && bodyInput.value.trim())
    || (formatSelect.value === 'written' && required<HTMLInputElement>('#youtube-video-id').value.trim());
  if (discards && !window.confirm('Cambiar de formato descartará el contenido incompatible. ¿Continuar?')) {
    formatSelect.value = formatSelect.value === 'video' ? 'written' : 'video';
  } else if (formatSelect.value === 'video') {
    bodyInput.value = '';
    draft = updateNoteDraft(draft, { body: '', uploadTokens: [] });
  } else required<HTMLInputElement>('#youtube-video-id').value = '';
  syncFormat();
});
form.addEventListener('input', syncDraft);
form.addEventListener('change', syncDraft);
required<HTMLInputElement>('#category-query').addEventListener('input', renderCategories);
required<HTMLFormElement>('#content-filters').addEventListener('input', renderOutline);
required<HTMLFormElement>('#content-filters').addEventListener('change', renderOutline);
required<HTMLFormElement>('#content-filters').addEventListener('reset', () => requestAnimationFrame(renderOutline));

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-markdown-command]')) {
  button.addEventListener('click', () => {
    const command = button.dataset.markdownCommand as MarkdownCommand;
    let detail = '';
    if (command === 'link') detail = window.prompt('URL HTTPS del enlace', 'https://') ?? '';
    if (command === 'image') detail = window.prompt('Ruta relativa de la imagen', 'assets/imagen.png') ?? '';
    if (command === 'video') detail = window.prompt('URL de YouTube', 'https://youtu.be/M7lc1UVf-VE') ?? '';
    const edit = applyMarkdownCommand(bodyInput.value, bodyInput.selectionStart, bodyInput.selectionEnd, command, detail);
    bodyInput.value = edit.value;
    bodyInput.focus();
    bodyInput.setSelectionRange(edit.selectionStart, edit.selectionEnd);
    syncDraft();
  });
}

imageInput.addEventListener('change', async () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  imagePreview.src = URL.createObjectURL(file);
  imagePreview.alt = imageAlt.value || 'Vista previa local de la imagen seleccionada';
  imageMeta.textContent = `${file.name} · ${file.type || 'tipo desconocido'} · ${Math.ceil(file.size / 1024)} KiB`;
  uploadPreview.hidden = false;
  try {
    const staged = await api.upload(file);
    const insertion = `\n\n![${imageAlt.value.trim() || 'Imagen'}](${staged.markdownReference})\n`;
    bodyInput.setRangeText(insertion, bodyInput.selectionStart, bodyInput.selectionEnd, 'end');
    draft = updateNoteDraft(draft, { body: bodyInput.value, uploadTokens: [...draft.values.uploadTokens, staged.uploadToken] });
    required<HTMLElement>('#image-error').textContent = '';
    status.textContent = 'Imagen preparada. Se copiará únicamente al guardar la nota.';
    syncDirtyGuard();
    schedulePreview();
  } catch (error) {
    required<HTMLElement>('#image-error').textContent = error instanceof Error ? error.message : 'No se pudo preparar la imagen.';
  }
});

required<HTMLButtonElement>('#refresh-preview').addEventListener('click', refreshPreview);
required<HTMLButtonElement>('#show-editor').addEventListener('click', () => showView('editor'));
required<HTMLButtonElement>('#show-preview').addEventListener('click', () => showView('preview'));

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  draft = updateNoteDraft(draft, valuesFromForm());
  const validated = validateNoteDraft(draft, bootstrap.snapshot.categories);
  if (Object.keys(validated.fieldIssues).length > 0) return showIssues(validated.fieldIssues);
  clearIssues();
  saveButton.disabled = true;
  status.textContent = 'Guardando nota…';
  const values = validated.values;
  const payload: NoteMutationInput = { ...values, topic: values.topic || undefined, youtubeVideoId: values.format === 'video' ? values.youtubeVideoId : undefined };
  try {
    const result = draft.identity && draft.baseRevision
      ? await api.updateNote(draft.identity.folder, draft.identity.id, draft.baseRevision, payload)
      : await api.createNote(payload);
    status.textContent = `${result.message ?? 'Nota guardada.'} ${(result.changedPaths ?? []).join(', ')}`;
    activeNotePath = result.data.sourcePath;
    draft = createNoteDraft(values, { baseRevision: result.data.revision, identity: { folder: result.data.folder, id: result.data.id } });
    dirtyBadge.hidden = true;
    await initialize(false);
    loadNote(activeNotePath);
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) {
    if (error instanceof AdminApiError && error.body.error.issues) {
      const grouped: Record<string, string[]> = {};
      for (const issue of error.body.error.issues) grouped[issue.field] = [...(grouped[issue.field] ?? []), issue.message];
      showIssues(grouped);
    }
    status.textContent = error instanceof Error ? error.message : 'No se pudo guardar la nota.';
  } finally {
    saveButton.disabled = false;
    syncDirtyGuard();
  }
});

required<HTMLButtonElement>('#new-note').addEventListener('click', async (event) => {
  if (!await guard.confirmNavigation(event.currentTarget as HTMLButtonElement)) return;
  resetNote();
  showView('editor');
  titleInput.focus();
});

required<HTMLButtonElement>('#trash-note').addEventListener('click', async () => {
  if (!draft.identity || !draft.baseRevision || !confirm(`Mover “${draft.values.title}” a la papelera recuperable?`)) return;
  try {
    const result = await api.trashNote(draft.identity.folder, draft.identity.id, draft.baseRevision);
    status.textContent = `${result.message} ${result.data.trashId}`;
    await initialize(false);
    resetNote();
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo mover la nota.'; }
});

saveOrderButton.addEventListener('click', async () => {
  if (!currentOrder) return;
  try {
    const result = await api.saveOrder(currentOrder.categoryId, orderPayload(currentOrder));
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    orderDirty = false;
    await initialize(false);
    syncDirtyGuard();
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'No se pudo guardar el orden.';
    orderAnnouncement.textContent = 'El orden no se guardó. El borrador permanece disponible.';
  }
});

discardOrderButton.addEventListener('click', () => {
  const category = currentCategory();
  if (!category) return;
  currentOrder = createOrderDraft(category, bootstrap.snapshot.notes);
  orderDirty = false;
  orderAnnouncement.textContent = 'Orden descartado.';
  syncDirtyGuard();
  renderOutline();
});

activeCategoryName.addEventListener('input', () => {
  categoryNameDirty = activeCategoryName.value.trim() !== currentCategory()?.name;
  saveCategoryName.hidden = !categoryNameDirty;
  syncDirtyGuard();
});

saveCategoryName.addEventListener('click', async () => {
  const category = currentCategory();
  if (!category || !activeCategoryName.value.trim()) return;
  try {
    const result = await api.updateCategory(category.id, category.revision, {
      id: category.id,
      name: activeCategoryName.value.trim(),
      description: category.description,
      image: category.image,
      level: category.level,
    });
    status.textContent = result.message ?? 'Categoría actualizada.';
    categoryNameDirty = false;
    await initialize(false);
    window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo actualizar la categoría.'; }
});

required<HTMLButtonElement>('#new-category').addEventListener('click', () => {
  showWorkspace('structure');
  window.dispatchEvent(new Event('content-admin:new-category'));
});
required<HTMLButtonElement>('#new-topic').addEventListener('click', () => {
  showWorkspace('structure');
  window.dispatchEvent(new CustomEvent('content-admin:new-topic', { detail: { categoryId: currentCategoryId } }));
});

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-workspace]')) {
  button.addEventListener('click', () => {
    const target = button.dataset.workspace;
    if (target === 'note') showWorkspace('note');
    if (target === 'order') {
      categoryWorkspace.classList.remove('show-editor');
      required<HTMLElement>('.outline-panel').scrollIntoView({ block: 'start' });
    }
    if (target === 'structure' || target === 'trash') showWorkspace(target);
  });
}

required<HTMLButtonElement>('#mobile-back').addEventListener('click', () => {
  adminShell.classList.remove('has-selection');
  categoryWorkspace.classList.remove('show-editor');
});

required<HTMLSelectElement>('#order-category').addEventListener('change', (event) => {
  const id = (event.currentTarget as HTMLSelectElement).value;
  const trigger = required<HTMLElement>('#order-category');
  if (id) selectCategory(id, trigger).catch(() => undefined);
});

initialize().then(() => {
  if (currentCategoryId) resetNote();
}).catch((error) => { status.textContent = error instanceof Error ? error.message : 'No se pudo cargar el administrador.'; });

window.addEventListener('content-admin:refresh', () => { initialize(false).catch(() => undefined); });
