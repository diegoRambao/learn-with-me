import { expect, test } from '@playwright/test';

test('opens the first Flutter note and preserves route order', async ({ page }) => {
  await page.goto('/categorias/flutter-basic/');
  await expect(page).toHaveURL(/\/categorias\/flutter-basic\/flutter-basic-intro\/$/);
  const navigation = page.getByRole('navigation', { name: 'Notas de Flutter Basico' });
  await expect(navigation.getByRole('link')).toHaveCount(3);
  await expect(navigation.getByRole('link').first()).toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('link').nth(1)).toContainText('Composición de widgets');
});

test('navigates to another note without leaving its category', async ({ page }) => {
  await page.goto('/categorias/flutter-basic/flutter-basic-intro/');
  await page.getByRole('navigation', { name: 'Notas de Flutter Basico' }).getByRole('link', { name: /Estado y actualización/ }).click();
  await expect(page).toHaveURL(/\/categorias\/flutter-basic\/flutter-basic-state\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Estado y actualización de la interfaz');
});

test('shows a friendly empty route', async ({ page }) => {
  await page.goto('/categorias/aws/');
  await expect(page.getByRole('heading', { name: 'Esta ruta aún no tiene notas' })).toBeVisible();
  await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
});

test('provides only real Dart neighbors in written–video–written order', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/categorias/dart/dart-types/');
  const firstNavigation = page.getByRole('navigation', { name: 'Navegación entre notas' });
  await expect(firstNavigation.getByRole('link')).toHaveCount(1);
  await expect(firstNavigation.getByRole('link')).toContainText('Siguiente');
  await expect(firstNavigation.getByRole('link')).toContainText('Dart en una sesión práctica');

  await firstNavigation.getByRole('link').focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/categorias\/dart\/dart-video\/$/);
  const middleNavigation = page.getByRole('navigation', { name: 'Navegación entre notas' });
  await expect(middleNavigation.getByRole('link')).toHaveCount(2);
  await expect(middleNavigation.getByRole('link').first()).toContainText('Anterior');
  await expect(middleNavigation.getByRole('link').nth(1)).toContainText('Siguiente');

  await page.goto('/categorias/dart/dart-function/');
  const lastNavigation = page.getByRole('navigation', { name: 'Navegación entre notas' });
  await expect(lastNavigation.getByRole('link')).toHaveCount(1);
  await expect(lastNavigation.getByRole('link')).toContainText('Anterior');
  expect(await page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});
