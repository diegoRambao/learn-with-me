import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';

test('moves, lists, restores, and separately purges a recoverable note', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The mutating trash journey runs once.');
  await setupAdminRepository();
  await page.goto(adminUrl);
  await page.getByRole('button', { name: /^Dart / }).click();
  await page.getByRole('button', { name: /Introducción/ }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Mover a papelera' }).click();
  await expect(page.getByRole('status').first()).toContainText('Nota movida a la papelera');

  await page.getByRole('button', { name: 'Papelera', exact: true }).click();
  const entry = page.locator('#trash-items li').filter({ hasText: 'Introducción' });
  await expect(entry).toBeVisible();
  await entry.getByRole('button', { name: 'Restaurar' }).click();
  await expect(page.getByRole('status').first()).toContainText('Nota restaurada');

  await page.getByRole('button', { name: 'Nota', exact: true }).click();
  await page.getByRole('button', { name: /Introducción/ }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Mover a papelera' }).click();
  await page.getByRole('button', { name: 'Papelera', exact: true }).click();
  const purgeEntry = page.locator('#trash-items li').filter({ hasText: 'Introducción' });
  const trashId = await purgeEntry.getAttribute('data-trash-id');
  page.on('dialog', (dialog) => dialog.type() === 'prompt' ? dialog.accept(trashId ?? '') : dialog.accept());
  await purgeEntry.getByRole('button', { name: 'Eliminar definitivamente' }).click();
  await expect(page.getByRole('status').first()).toContainText('Entrada eliminada definitivamente');
  await expect(page.getByText('La papelera está vacía.')).toBeVisible();
});
