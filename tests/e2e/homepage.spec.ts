import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.goto('/'));

test('explains the purpose, use and three benefits', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Aprender conecta');
  await expect(page.getByText('maestría en didáctica de las matemáticas')).toBeVisible();
  await expect(page.getByText('educación de personas adultas')).toBeVisible();
  await expect(page.getByText('educación popular y el aprendizaje significativo')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Cómo utilizar este espacio' })).toBeVisible();
  for (const benefit of ['Aprendizaje estructurado y organizado', 'Contenido de calidad y actualizado', 'Aprendizaje desde la experiencia del autor']) {
    await expect(page.getByRole('heading', { name: benefit })).toBeVisible();
  }
});

test('offers stable semantic navigation and an operable skip link', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '/categorias/');
  const categoryLinks = page.getByRole('navigation', { name: 'Categorías' }).getByRole('link');
  await expect(categoryLinks).toHaveCount(4);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});

test('uses an accessible dark palette', async ({ page }) => {
  const contrastRatio = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    const parse = (color: string) => color.match(/\d+/g)!.slice(0, 3).map(Number);
    const luminance = (color: string) => {
      const channels = parse(color).map((value) => {
        const normalized = value / 255;
        return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
      });
      return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
    };
    const foreground = luminance(style.color);
    const background = luminance(getComputedStyle(document.documentElement).backgroundColor);
    return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
  });
  expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
});

test('keeps content available with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.getByRole('main')).toBeVisible();
  const duration = await page.locator('a').first().evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(Number.parseFloat(duration)).toBeLessThanOrEqual(0.00001);
});

test('reflows without horizontal scrolling at a 200% equivalent viewport', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Categorías', exact: true }).first()).toBeVisible();
});

test('omits social placeholders when no profiles are configured', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Continúa la conversación' })).toHaveCount(0);
  await expect(page.locator('a[href*="perfil-del-autor"]')).toHaveCount(0);
});
