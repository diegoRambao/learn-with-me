import type { BootstrapData, TrashSummary } from '../contracts';
import { createAdminApi } from './admin-api';

const api = createAdminApi();
const list = document.querySelector<HTMLUListElement>('#trash-items') as HTMLUListElement;
const empty = document.querySelector<HTMLElement>('#trash-empty') as HTMLElement;
const status = document.querySelector<HTMLElement>('#admin-status') as HTMLElement;
let data: BootstrapData;

const render = (): void => {
  list.replaceChildren();
  empty.hidden = data.trash.length > 0;
  for (const entry of data.trash) {
    const item = document.createElement('li');
    item.dataset.trashId = entry.trashId;
    const summary = document.createElement('div');
    const title = document.createElement('strong'); title.textContent = entry.title;
    const detail = document.createElement('p'); detail.textContent = `${entry.category} · ${entry.originalPath} · ${new Date(entry.deletedAt).toLocaleString('es')}`;
    summary.append(title, detail);
    const restore = document.createElement('button'); restore.type = 'button'; restore.textContent = 'Restaurar'; restore.disabled = !entry.canRestore;
    const purge = document.createElement('button'); purge.type = 'button'; purge.textContent = 'Eliminar definitivamente'; purge.className = 'danger';
    restore.addEventListener('click', () => restoreEntry(entry));
    purge.addEventListener('click', () => purgeEntry(entry));
    item.append(summary, restore, purge);
    list.append(item);
  }
};

const refresh = async (): Promise<void> => { data = await api.bootstrap(); render(); };
const restoreEntry = async (entry: TrashSummary): Promise<void> => {
  try {
    const result = await api.restoreTrash(entry.trashId, entry.manifestRevision);
    status.textContent = `${result.message} ${(result.changedPaths ?? []).join(', ')}`;
    await refresh(); window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo restaurar la nota.'; }
};
const purgeEntry = async (entry: TrashSummary): Promise<void> => {
  if (!confirm(`Eliminar definitivamente “${entry.title}”? Esta acción no se puede deshacer.`)) return;
  const confirmation = prompt('Escribe el ID exacto de la entrada', '') ?? '';
  try {
    await api.purgeTrash(entry.trashId, entry.manifestRevision, confirmation);
    status.textContent = 'Entrada eliminada definitivamente.';
    await refresh(); window.dispatchEvent(new Event('content-admin:refresh'));
  } catch (error) { status.textContent = error instanceof Error ? error.message : 'No se pudo eliminar la entrada.'; }
};

window.addEventListener('content-admin:refresh', () => { refresh().catch(() => undefined); });
refresh().catch((error) => { status.textContent = error instanceof Error ? error.message : 'No se pudo cargar la papelera.'; });
