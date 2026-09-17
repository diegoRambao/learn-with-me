import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.goto('/'));

test('presents personal study notes without academy language', async ({ page }) => {
  const main = page.getByRole('main');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Lo que estudio');
  await expect(main).toContainText('apuntes personales');
  await expect(main).toContainText('temas que voy estudiando');
  await expect(main).toContainText('estudiar o repasar');
  await expect(main).not.toContainText(/\b(clase|clases|curso|cursos|academia)\b/i);
  await expect(page.getByRole('heading', { name: 'Cómo usar estos apuntes' })).toBeVisible();
  for (const benefit of ['Ideas ordenadas', 'Un archivo para volver', 'Aprendizaje compartido']) {
    await expect(page.getByRole('heading', { name: benefit })).toBeVisible();
  }
});

test('uses a consistent decorative icon system without changing accessible names', async ({ page }) => {
  const header = page.getByRole('banner');
  await expect(header.locator('svg.ui-icon')).toHaveCount(4);
  await expect(header.locator('svg.ui-icon[aria-hidden="true"]')).toHaveCount(4);
  await expect(page.getByRole('link', { name: 'Explorar categorías' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explorar más rutas' })).toBeVisible();
  await expect(page.locator('.benefit-card svg.benefit-glyph')).toHaveCount(3);
  await expect(page.locator('main')).not.toContainText(/[←→↗⌄×⌁↺∴◇]/);
});

test('replaces the sidebar with a central route to the category catalog', async ({ page }) => {
  await expect(page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Categorías' })).toHaveAttribute('href', '/categorias/');
  await expect(page.locator('main aside')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Categorías' })).toHaveCount(0);
  const primaryCallToAction = page.getByRole('link', { name: 'Explorar categorías' });
  await expect(primaryCallToAction).toHaveAttribute('href', '/categorias/');
  await expect(primaryCallToAction).toHaveAttribute('data-primary-cta', '');
  const callToActionBox = await primaryCallToAction.boundingBox();
  const viewport = page.viewportSize();
  expect(callToActionBox).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(Math.abs((callToActionBox!.x + callToActionBox!.width / 2) - viewport!.width / 2)).toBeLessThan(80);
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
});

test('shows three primary routes and three accessible teasers in stable order', async ({ page }) => {
  const primaryRoutes = page.locator('[data-route-group="primary"] article[data-category-id]');
  const teaserRoutes = page.locator('[data-route-group="teaser"] article[data-category-id]');
  await expect(primaryRoutes).toHaveCount(3);
  await expect(teaserRoutes).toHaveCount(3);

  const visibleIds = await page.locator('[data-home-routes] article[data-category-id]').evaluateAll((cards) =>
    cards.map((card) => card.getAttribute('data-category-id')),
  );
  expect(visibleIds).toEqual(['aws-practitioner', 'dart', 'sdd', 'flutter-basic', 'design-patterns', 'terminal']);
  expect(new Set(visibleIds).size).toBe(6);

  for (const link of await page.locator('[data-home-routes] article[data-category-id] a').all()) {
    await expect(link).toHaveAttribute('href', /^\/categorias\/[a-z0-9-]+\/(?:[a-z0-9-]+\/)?$/);
  }

  const teaserLink = teaserRoutes.getByRole('link').first();
  await teaserLink.focus();
  await expect(teaserLink).toBeFocused();
  await expect(teaserLink).toBeVisible();
  await expect(page.locator('[data-route-fade]')).toHaveCSS('pointer-events', 'none');
});

test('keeps the route catalog call to action above the decorative fade', async ({ page }) => {
  const exploreMore = page.getByRole('link', { name: 'Explorar más rutas' });
  await expect(exploreMore).toHaveAttribute('href', '/categorias/');
  await expect(exploreMore).toBeVisible();
  const fadeLayer = page.locator('[data-route-fade]');
  const callToActionLayer = await exploreMore.evaluate((element) => Number(getComputedStyle(element).zIndex));
  const decorativeLayer = await fadeLayer.evaluate((element) => Number(getComputedStyle(element).zIndex));
  expect(callToActionLayer).toBeGreaterThan(decorativeLayer);
});

test('falls back when a preview image cannot load', async ({ page }) => {
  const firstImage = page.locator('[data-home-routes] [data-category-image]').first();
  await firstImage.evaluate((image: HTMLImageElement) => { image.src = '/images/categories/missing.svg'; });
  await expect(firstImage).toHaveAttribute('src', '/category-fallback.svg');
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

test('keeps the route preview in one readable column at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await expect(page.locator('[data-home-routes]')).toBeVisible();
  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});

test('omits social placeholders when no profiles are configured', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Continúa la conversación' })).toHaveCount(0);
  await expect(page.locator('a[href*="perfil-del-autor"]')).toHaveCount(0);
});
