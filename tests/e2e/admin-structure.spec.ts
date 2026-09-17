import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Mutating structure journeys run once against the isolated fixture.');
  await setupAdminRepository();
  await page.goto(adminUrl);
});

test('creates and edits categories/topics, blocks dependencies, and reorders with buttons', async ({ page }) => {
  await page.getByRole('button', { name: 'Estructura' }).click();
  const categoryForm = page.locator('#category-form');
  const topicForm = page.locator('#topic-form');
  await categoryForm.getByLabel('ID estable').fill('astro');
  await categoryForm.getByLabel('Nombre').fill('Astro');
  await categoryForm.getByLabel('Descripción').fill('Framework web');
  await categoryForm.getByLabel('Imagen').fill('/images/categories/astro.svg');
  await categoryForm.getByLabel('Nivel').selectOption('intermediate');
  await categoryForm.getByRole('button', { name: 'Guardar categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Categoría creada');

  await topicForm.getByLabel('Categoría').selectOption('astro');
  await topicForm.getByLabel('ID estable').fill('fundamentos');
  await topicForm.getByLabel('Nombre').fill('Fundamentos');
  await topicForm.getByLabel('Posición global').fill('1');
  await topicForm.getByRole('button', { name: 'Guardar tema' }).click();
  await expect(page.getByRole('status').first()).toContainText('Tema creado');

  await categoryForm.getByLabel('Editar existente').selectOption('astro');
  await categoryForm.getByLabel('Nombre').fill('Astro moderno');
  await categoryForm.getByRole('button', { name: 'Guardar categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Categoría actualizada');

  await categoryForm.getByLabel('Editar existente').selectOption('dart');
  page.on('dialog', async (dialog) => dialog.type() === 'prompt' ? dialog.accept('dart') : dialog.accept());
  await categoryForm.getByRole('button', { name: 'Eliminar categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Reasigna o elimina');

  await page.getByRole('button', { name: /^Dart / }).click();
  await page.getByRole('button', { name: 'Orden' }).click();
  const noteRow = page.locator('.note-order-row').filter({ hasText: 'Nota · Tipos' });
  await noteRow.getByRole('button', { name: 'Subir' }).click();
  await expect(page.getByText(/Tipos.*posición 2/)).toBeVisible();
  await page.getByRole('button', { name: 'Guardar orden' }).click();
  await expect(page.getByRole('status').first()).toContainText('Orden guardado');
});

test('moves a note to another topic with drag and drop, then persists the assignment', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The drag journey runs once against the isolated fixture.');
  await page.getByRole('button', { name: /^Dart / }).click();
  const note = page.locator('.note-order-row').filter({ hasText: 'Nota · Tipos' });
  const destination = page.locator('.topic-group[data-topic-id="practica"]');
  await note.dragTo(destination);
  await expect(note.getByLabel(/Mover Tipos/)).toHaveValue('practica');
  await page.getByRole('button', { name: 'Guardar orden' }).click();
  await expect(page.getByRole('status').first()).toContainText('Orden guardado');
});
