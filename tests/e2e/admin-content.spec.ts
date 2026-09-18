import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import matter from 'gray-matter';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';
const fixtureRoot = join(process.cwd(), '.content-admin/e2e-repository');
const pngBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

test.beforeEach(async () => setupAdminRepository());

test('creates a complete written note with keyboard-accessible controls, upload, preview, and path confirmation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The mutating admin journey runs once against its isolated fixture.');
  await page.goto(adminUrl);
  const noteForm = page.locator('#note-form');
  await expect(page.getByRole('heading', { name: 'Administrador local' })).toBeVisible();
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');

  await noteForm.getByLabel('Título', { exact: true }).fill('Nueva nota E2E');
  await expect(noteForm.getByLabel('ID del archivo')).toHaveValue('nueva-nota-e2e');
  await noteForm.getByLabel('Descripción').fill('Creada desde el recorrido administrativo');
  await noteForm.getByLabel('Categoría').selectOption('dart');
  await noteForm.getByLabel('Tema (opcional)').selectOption('fundamentos');
  await noteForm.getByLabel('Posición global').fill('4');
  await noteForm.getByLabel('Etiquetas').fill('dart, e2e');
  await noteForm.getByRole('textbox', { name: 'Markdown', exact: true }).fill('# Creada desde la interfaz\n\nTexto de prueba.');
  await noteForm.getByLabel('Texto alternativo').fill('Diagrama de prueba');
  await noteForm.getByLabel(/Archivo PNG/).setInputFiles({ name: 'diagram.png', mimeType: 'image/png', buffer: pngBytes });
  await expect(page.getByRole('status').first()).toContainText('Imagen preparada');

  await page.getByRole('button', { name: 'Vista previa' }).click();
  await page.getByRole('button', { name: 'Actualizar vista previa' }).click();
  await expect(page.getByText('Vista previa actualizada.')).toBeVisible();
  await expect(page.locator('#note-preview').contentFrame().getByRole('heading', { name: 'Nueva nota E2E' })).toBeVisible();

  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(page.getByRole('status').first()).toContainText('src/content/notes/dart/nueva-nota-e2e.md');

  const document = matter(await readFile(join(fixtureRoot, 'src/content/notes/dart/nueva-nota-e2e.md'), 'utf8'));
  expect(document.data).toMatchObject({ category: 'dart', topic: 'fundamentos', position: 4, tags: ['dart', 'e2e'] });
  expect(document.content).toContain('![Diagrama de prueba](assets/diagram.png)');
  expect(await readFile(join(fixtureRoot, 'src/content/notes/dart/assets/diagram.png'))).toEqual(pngBytes);
});

test('keeps the draft and focuses an actionable summary when validation fails', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The admin validation journey runs once against its isolated fixture.');
  await page.goto(adminUrl);
  const noteForm = page.locator('#note-form');
  await noteForm.getByLabel('Título', { exact: true }).fill('Borrador sin datos');
  await page.getByRole('button', { name: 'Guardar nota' }).click();
  const summary = page.getByRole('alert').filter({ hasText: 'Revisa el borrador' });
  await expect(summary).toBeVisible();
  await expect(noteForm.getByLabel('Título', { exact: true })).toHaveValue('Borrador sin datos');
  await expect(noteForm.getByLabel('Descripción')).toHaveAttribute('aria-invalid', 'true');
});

test('opens a full focus workspace with live editor and preview', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The desktop focus layout runs once.');
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');
  await page.getByLabel('Título', { exact: true }).fill('Nota enfocada');
  await page.getByRole('textbox', { name: 'Markdown', exact: true }).fill('## Primer borrador');

  const focusButton = page.getByRole('button', { name: 'Modo enfoque' });
  await focusButton.click();
  await expect(page.locator('body')).toHaveClass(/focus-mode/);
  await expect(page.getByRole('navigation', { name: 'Categorías' })).toBeHidden();
  await expect(page.getByRole('textbox', { name: 'Markdown', exact: true })).toBeVisible();
  await expect(page.locator('#note-preview')).toBeVisible();
  await expect(page.locator('#note-preview').contentFrame().getByRole('heading', { name: 'Nota enfocada' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Salir del modo enfoque' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toHaveClass(/focus-mode/);
  await expect(focusButton).toBeFocused();
  await expect(page.getByRole('textbox', { name: 'Markdown', exact: true })).toHaveValue('## Primer borrador');
});
