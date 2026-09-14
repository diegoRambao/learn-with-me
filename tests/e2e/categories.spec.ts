import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.goto('/categorias/'));

test('shows every category and filters by each level', async ({ page }) => {
  await expect(page.locator('article[data-level]')).toHaveCount(4);
  for (const [label, level] of [['Principiante', 'beginner'], ['Intermedio', 'intermediate'], ['Avanzado', 'advanced'], ['Pro', 'pro']] as const) {
    const button = page.getByRole('button', { name: label });
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(`article[data-level="${level}"]:visible`)).toHaveCount(1);
    await expect(page.locator('[data-matching-count]')).toHaveText('1');
  }
  await page.getByRole('button', { name: 'Todos' }).click();
  await expect(page.locator('article[data-level]:visible')).toHaveCount(4);
});

test('provides names, levels, images and canonical links', async ({ page }) => {
  const cards = page.locator('article[data-level]');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) {
    await expect(card.getByRole('heading')).toBeVisible();
    await expect(card.getByRole('img')).toHaveAttribute('width', '800');
    await expect(card.getByRole('link')).toHaveAttribute('href', /^\/categorias\/[a-z0-9-]+\/$/);
  }
  const firstImage = cards.first().getByRole('img');
  await firstImage.evaluate((image: HTMLImageElement) => { image.src = '/images/categories/missing.svg'; });
  await expect(firstImage).toHaveAttribute('src', '/category-fallback.svg');
});

test('shows and clears the zero-match state', async ({ page }) => {
  await page.locator('article[data-level]').evaluateAll((cards) => cards.forEach((card) => card.setAttribute('data-level', 'unavailable')));
  await page.getByRole('button', { name: 'Pro', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No hay categorías para este nivel' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver todas' }).click();
  await expect(page.locator('article[data-level]:visible')).toHaveCount(4);
});

test('ignores unknown notice parameters', async ({ page }) => {
  await page.goto('/categorias/?notice=unknown');
  await expect(page.locator('[data-invalid-notice]')).toBeHidden();
});

test('updates filters well below the local p95 budget', async ({ page }) => {
  const durations = await page.evaluate(() => {
    const grid = document.querySelector('[data-category-grid]');
    const originals = [...document.querySelectorAll<HTMLElement>('article[data-level]')];
    for (let index = originals.length; index < 100; index += 1) grid?.append(originals[index % originals.length].cloneNode(true));
    const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
    const measurements: number[] = [];
    for (let index = 0; index < 20; index += 1) {
      const started = performance.now();
      buttons[index % buttons.length].click();
      document.querySelector('[data-matching-count]')?.textContent;
      measurements.push(performance.now() - started);
    }
    return measurements.sort((left, right) => left - right);
  });
  expect(durations[Math.floor(durations.length * 0.95)]).toBeLessThan(100);
});
