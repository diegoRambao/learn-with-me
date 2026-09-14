import { expect, test } from '@playwright/test';

test('opens the first Flutter note and preserves route order', async ({ page }) => {
  await page.goto('/categorias/flutter/');
  await expect(page).toHaveURL(/\/categorias\/flutter\/flutter-intro\/$/);
  const navigation = page.getByRole('navigation', { name: 'Notas de Flutter' });
  await expect(navigation.getByRole('link')).toHaveCount(3);
  await expect(navigation.getByRole('link').first()).toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('link').nth(1)).toContainText('Composición de widgets');
});

test('navigates to another note without leaving its category', async ({ page }) => {
  await page.goto('/categorias/flutter/flutter-intro/');
  await page.getByRole('navigation', { name: 'Notas de Flutter' }).getByRole('link', { name: /Estado y actualización/ }).click();
  await expect(page).toHaveURL(/\/categorias\/flutter\/flutter-state\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estado y actualización de la interfaz');
});

test('shows a friendly empty route', async ({ page }) => {
  await page.goto('/categorias/aws/');
  await expect(page.getByRole('heading', { name: 'Esta ruta aún no tiene notas' })).toBeVisible();
  await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
});

