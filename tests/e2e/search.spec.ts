import { expect, test } from '@playwright/test';

const search = async (page: import('@playwright/test').Page, query: string): Promise<void> => {
  await page.getByRole('searchbox', { name: 'Buscar categorías y notas' }).fill(query);
  await page.getByRole('button', { name: 'Buscar' }).click();
};

test('searches from the shared header and preserves a shareable query URL', async ({ page }) => {
  await page.goto('/');
  await search(page, 'dart');
  await expect(page).toHaveURL(/\/buscar\/\?q=dart/);
  await expect(page.getByRole('heading', { name: 'Categorías', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notas', exact: true })).toBeVisible();
  await expect(page.locator('[data-search-type="category"]:not([hidden])')).toHaveCount(1);
  await expect(page.locator('[data-search-type="note"]:not([hidden])')).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Buscar categorías y notas' })).toHaveValue('dart');
  await expect(page.locator('[data-search-type="note"]:not([hidden])')).toHaveCount(3);
});

test('matches diacritics, case, partial terms, and all query tokens without searching bodies', async ({ page }) => {
  await page.goto('/buscar/?q=FLUTTER%20interfaz');
  await expect(page.locator('[data-search-type="note"]:not([hidden])')).toHaveCount(1);
  await page.goto('/buscar/?q=desarrollo%20especificaciones');
  await expect(page.locator('[data-search-type="category"]:not([hidden])')).toHaveCount(1);
  await page.goto('/buscar/?q=contenido%20no-buscable');
  await expect(page.getByRole('status')).toContainText('No hubo coincidencias');
});

test('communicates initial, invalid, partial, and empty states', async ({ page }) => {
  await page.goto('/buscar/');
  await expect(page.getByRole('status')).toContainText('Escribe un término');
  await page.goto('/buscar/?q=%20%20');
  await expect(page.getByRole('status')).toContainText('Escribe un término');
  await page.goto('/buscar/?q=aws');
  await expect(page.getByText('No hay notas que coincidan con la búsqueda.')).toBeVisible();
  await page.goto('/buscar/?q=sin-coincidencias');
  await expect(page.getByRole('status')).toContainText('No hubo coincidencias');
});

test('renders contextual result cards, fallback images, keyboard navigation, and 320px layout', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/buscar/?q=dart');
  const category = page.locator('[data-search-type="category"]:not([hidden])');
  const note = page.locator('[data-search-type="note"]:not([hidden])').first();
  await expect(category.getByRole('img')).toHaveAttribute('alt', /Dart/);
  await expect(category.getByRole('link')).toHaveAttribute('href', '/categorias/dart/');
  await expect(note.getByRole('list', { name: 'Etiquetas' })).toBeVisible();
  await expect(note.getByRole('link')).toHaveAttribute('href', /\/categorias\/dart\//);
  await category.getByRole('img').evaluate((image: HTMLImageElement) => { image.src = '/missing.svg'; });
  await expect(category.getByRole('img')).toHaveAttribute('src', '/category-fallback.svg');
  await page.getByRole('searchbox', { name: 'Buscar categorías y notas' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Buscar' })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('keeps fifty representative searches below the response budget without content requests', async ({ page }) => {
  const queries = Array.from({ length: 50 }, (_, index) => ['dart', 'flutter', 'terminal', 'desarrollo', 'sin-coincidencias'][index % 5]);
  const durations: number[] = [];
  for (const query of queries) {
    const startedAt = performance.now();
    await page.goto(`/buscar/?q=${query}`);
    await expect(page.getByRole('status')).toContainText(query === 'sin-coincidencias' ? 'No hubo coincidencias' : 'resultado');
    durations.push(performance.now() - startedAt);
  }
  const p95 = [...durations].sort((left, right) => left - right)[Math.ceil(durations.length * .95) - 1];
  expect(p95).toBeLessThan(2_000);
  expect(await page.evaluate(() => performance.getEntriesByType('resource').every((entry) => !['fetch', 'xmlhttprequest'].includes((entry as PerformanceResourceTiming).initiatorType)))).toBe(true);
});
