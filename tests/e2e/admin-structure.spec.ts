import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Mutating structure journeys run once against the isolated fixture.');
  await setupAdminRepository();
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');
  await expect(page.getByRole('button', { name: 'Nueva categoría' })).toBeVisible();
});

test('creates and edits categories/topics, blocks dependencies, and reorders with buttons', async ({ page }) => {
  const newCategory = page.getByRole('button', { name: 'Nueva categoría' });
  const newTopic = page.getByRole('button', { name: 'Nuevo tema' });
  const newNote = page.getByRole('button', { name: 'Nueva nota' });
  await expect(newCategory).toBeVisible();
  await expect(newTopic).toBeVisible();
  await expect(newNote).toBeVisible();
  const creationIcons = await Promise.all([newCategory, newTopic, newNote].map((button) => button.locator('svg').evaluate((icon) => icon.innerHTML)));
  expect(new Set(creationIcons).size).toBe(3);

  await newCategory.click();
  const categoryDialog = page.getByRole('dialog', { name: 'Nueva categoría' });
  const categoryForm = page.locator('#category-form');
  await categoryForm.getByLabel('ID estable').fill('astro');
  await categoryForm.getByLabel('Nombre').fill('Astro');
  await categoryForm.getByLabel('Descripción').fill('Framework web');
  await categoryForm.getByLabel('Imagen').fill('/images/categories/astro.svg');
  await categoryForm.getByLabel('Nivel').selectOption('intermediate');
  await categoryForm.getByRole('button', { name: 'Crear categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Categoría creada');
  await expect(categoryDialog).toBeHidden();

  await page.getByRole('button', { name: /^Astro / }).click();
  await newTopic.click();
  const topicForm = page.locator('#topic-form');
  await topicForm.getByLabel('ID estable').fill('fundamentos');
  await topicForm.getByLabel('Nombre').fill('Fundamentos');
  await topicForm.getByRole('button', { name: 'Crear tema' }).click();
  await expect(page.getByRole('status').first()).toContainText('Tema creado');

  await page.getByRole('button', { name: 'Acciones de Fundamentos' }).click();
  await page.getByRole('button', { name: 'Editar tema Fundamentos' }).click();
  await expect(topicForm.getByLabel('ID estable')).toBeDisabled();
  await topicForm.getByLabel('Nombre').fill('Bases');
  await topicForm.getByRole('button', { name: 'Guardar tema' }).click();
  await expect(page.getByRole('status').first()).toContainText('Tema actualizado');

  await page.getByRole('button', { name: 'Acciones de Bases' }).click();
  await page.getByRole('button', { name: 'Eliminar tema Bases' }).click();
  await page.getByRole('dialog', { name: 'Eliminar tema' }).getByRole('button', { name: 'Eliminar tema' }).click();
  await expect(page.getByRole('status').first()).toContainText('Tema eliminado');

  await page.getByRole('button', { name: 'Acciones de Astro' }).click();
  await page.getByRole('button', { name: 'Editar categoría Astro' }).click();
  await expect(page.getByRole('dialog', { name: 'Editar categoría' })).toBeVisible();
  await expect(categoryForm.getByLabel('ID estable')).toBeDisabled();
  await categoryForm.getByLabel('Nombre').fill('Astro moderno');
  await categoryForm.getByRole('button', { name: 'Guardar categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Categoría actualizada');

  await page.getByRole('button', { name: 'Acciones de Astro moderno' }).click();
  await page.getByRole('button', { name: 'Eliminar categoría Astro moderno' }).click();
  const deleteAstro = page.getByRole('dialog', { name: 'Eliminar categoría' });
  await deleteAstro.getByLabel(/Escribe el ID/).fill('astro');
  await deleteAstro.getByRole('button', { name: 'Eliminar categoría' }).click();
  await expect(page.getByRole('status').first()).toContainText('Categoría eliminada');
  await expect(page.getByRole('button', { name: /^Astro moderno / })).toHaveCount(0);

  await page.getByRole('button', { name: 'Acciones de Dart' }).click();
  await page.getByRole('button', { name: 'Eliminar categoría Dart' }).click();
  const deleteDialog = page.getByRole('dialog', { name: 'Eliminar categoría' });
  await deleteDialog.getByLabel(/Escribe el ID/).fill('dart');
  await deleteDialog.getByRole('button', { name: 'Eliminar categoría' }).click();
  await expect(deleteDialog.getByRole('alert')).toContainText('Reasigna o elimina');
  await expect(deleteDialog.getByText('intro')).toBeVisible();
  await deleteDialog.getByRole('button', { name: 'Cancelar' }).click();

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
  await page.getByRole('button', { name: 'Nuevo tema' }).click();
  const topicForm = page.getByRole('dialog', { name: 'Nuevo tema' }).locator('#topic-form');
  await topicForm.getByLabel('ID estable').fill('practica');
  await topicForm.getByLabel('Nombre').fill('Práctica');
  await topicForm.getByRole('button', { name: 'Crear tema' }).click();
  await expect(page.getByRole('status').first()).toContainText('Tema creado');
  await page.getByRole('button', { name: 'Orden' }).click();
  const note = page.locator('.note-order-row').filter({ hasText: 'Nota · Tipos' });
  const destination = page.locator('.topic-group[data-topic-id="practica"]');
  await note.dragTo(destination);
  await expect(note.getByLabel(/Mover Tipos/)).toHaveValue('practica');
  await page.getByRole('button', { name: 'Guardar orden' }).click();
  await expect(page.getByRole('status').first()).toContainText('Orden guardado');
});
