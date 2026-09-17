import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';
const fixtureRoot = join(process.cwd(), '.content-admin/e2e-repository');

test('filters existing content, exposes invalid files, protects a dirty draft, and preserves it on conflict', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The mutating maintenance journey runs once.');
  await setupAdminRepository();
  await page.goto(adminUrl);
  await page.locator('.issues-panel summary').click();
  await expect(page.getByText(/broken\.md/).first()).toBeVisible();

  await page.getByRole('button', { name: /^Dart / }).click();
  await page.getByRole('button', { name: 'Filtros' }).click();
  await page.getByLabel('Etiqueta', { exact: true }).selectOption('tipos');
  await expect(page.getByRole('button', { name: /Tipos/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Introducción/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();

  await page.getByRole('button', { name: /Introducción/ }).click();
  await expect(page.getByRole('heading', { name: /Editar · Introducción/ })).toBeVisible();
  const markdown = page.getByRole('textbox', { name: 'Markdown', exact: true });
  await markdown.fill('# Borrador local');
  await page.getByRole('button', { name: /Tipos/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Tienes cambios sin guardar' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(markdown).toHaveValue('# Borrador local');

  await writeFile(join(fixtureRoot, 'src/content/notes/dart/intro.md'), 'cambio externo');
  await page.getByRole('button', { name: 'Guardar nota' }).click();
  await expect(page.getByRole('status').first()).toContainText('cambió desde que se abrió');
  await expect(markdown).toHaveValue('# Borrador local');

  await page.getByLabel('Buscar por título').fill('sin-coincidencias');
  await expect(page.getByText(/No hay resultados/)).toBeVisible();
  await expect(page.getByLabel('Buscar por título')).toHaveValue('sin-coincidencias');
});
