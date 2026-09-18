import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The keyboard and minimum-width audit runs once.');
  await setupAdminRepository();
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');
});

test('supports the critical keyboard, focus, announcement, and minimum-width flow', async ({ page }) => {
  const skipLink = page.getByRole('link', { name: 'Saltar al editor' });
  await skipLink.focus();
  await expect(skipLink).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#editor')).toBeFocused();

  await page.getByRole('button', { name: 'Nueva nota' }).click();
  const title = page.getByLabel('Título', { exact: true });
  await title.focus();
  await page.keyboard.type('Borrador accesible');
  await expect(page.getByText('Sin guardar', { exact: true })).toBeVisible();

  const markdown = page.getByRole('textbox', { name: 'Markdown', exact: true });
  await markdown.fill('texto seleccionado');
  await markdown.selectText();
  const bold = page.getByRole('button', { name: 'Negrita' });
  await bold.focus();
  await page.keyboard.press('Enter');
  await expect(markdown).toBeFocused();
  await expect(markdown).toHaveValue('**texto seleccionado**');

  const save = page.getByRole('button', { name: 'Guardar nota' });
  await save.focus();
  const outline = await save.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  const summary = page.getByRole('alert').filter({ hasText: 'Revisa el borrador' });
  await expect(summary).toBeFocused();
  await expect(page.locator('#note-description')).toHaveAttribute('aria-invalid', 'true');

  await page.reload();
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');
  await page.getByRole('button', { name: 'Volver a categorías' }).click();
  await page.getByRole('button', { name: /^Dart / }).click();
  const intro = page.getByRole('button', { name: /Introducción/ });
  await intro.focus();
  await page.keyboard.press('Enter');
  await markdown.fill('# Cambio sin guardar');
  await page.getByRole('button', { name: 'Orden' }).click();
  const types = page.getByRole('button', { name: /Tipos/ });
  await types.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Tienes cambios sin guardar' });
  await expect(dialog).toBeVisible();
  const stay = dialog.getByRole('button', { name: 'Seguir editando' });
  await expect(stay).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(types).toBeFocused();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
