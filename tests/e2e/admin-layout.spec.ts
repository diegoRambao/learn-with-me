import { expect, test } from '@playwright/test';
import { setupAdminRepository } from './admin-global-setup';

const adminUrl = 'http://127.0.0.1:4322';
const storageKey = 'content-admin:categories-panel:v1';

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The responsive admin layout audit runs once.');
  await setupAdminRepository();
  await page.setViewportSize({ width: 1280, height: 800 });
});

test('collapses the category panel from the keyboard and restores the preference', async ({ page }) => {
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');

  const toggle = page.locator('#toggle-categories');
  const panelContent = page.locator('#category-panel-content');
  const workspace = page.locator('.workspace-panel');
  const expandedWidth = (await workspace.boundingBox())?.width ?? 0;

  await toggle.focus();
  await page.keyboard.press('Enter');

  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveAccessibleName('Mostrar categorías');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(panelContent).toBeHidden();
  expect((await workspace.boundingBox())?.width ?? 0).toBeGreaterThan(expandedWidth);
  expect(await page.evaluate((key) => localStorage.getItem(key), storageKey)).toBe('collapsed');

  await page.reload();
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');
  await expect(page.getByRole('button', { name: 'Mostrar categorías' })).toHaveAttribute('aria-expanded', 'false');
  await expect(panelContent).toBeHidden();
});

test('falls back to a visible, operable panel when storage is invalid or unavailable', async ({ page, context }) => {
  await page.addInitScript(([key]) => localStorage.setItem(key, 'valor-inesperado'), [storageKey]);
  await page.goto(adminUrl);
  await expect(page.getByRole('button', { name: 'Ocultar categorías' })).toBeVisible();
  await expect(page.locator('#category-panel-content')).toBeVisible();

  const blockedStoragePage = await context.newPage();
  await blockedStoragePage.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { configurable: true, get: () => { throw new Error('blocked'); } });
  });
  await blockedStoragePage.goto(adminUrl);
  const toggle = blockedStoragePage.getByRole('button', { name: 'Ocultar categorías' });
  await toggle.click();
  await expect(blockedStoragePage.getByRole('button', { name: 'Mostrar categorías' })).toBeFocused();
  await expect(blockedStoragePage.locator('#category-panel-content')).toBeHidden();
});

test('keeps categories available on mobile even with a collapsed desktop preference', async ({ page }) => {
  await page.addInitScript(([key]) => localStorage.setItem(key, 'collapsed'), [storageKey]);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');

  await expect(page.locator('#toggle-categories')).toBeHidden();
  await page.getByRole('button', { name: 'Volver a categorías' }).click();
  await expect(page.locator('#category-panel-content')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('gives note titles their own wrapping row at desktop widths', async ({ page }) => {
  await page.goto(adminUrl);
  await expect(page.getByRole('status').first()).toContainText('Inventario listo');

  for (const width of [1024, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    const row = page.locator('.note-order-row:not([hidden])').first();
    const title = row.locator('.note-select');
    const actions = row.locator('.row-actions');
    await expect(title).toBeVisible();

    const titleMetrics = await title.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
      whiteSpace: getComputedStyle(element).whiteSpace,
    }));
    const titleBox = await title.boundingBox();
    const actionsBox = await actions.boundingBox();

    expect(titleMetrics.whiteSpace).toBe('normal');
    expect(titleMetrics.scrollWidth).toBeLessThanOrEqual(titleMetrics.clientWidth);
    expect(titleBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    expect(actionsBox!.y).toBeGreaterThanOrEqual(titleBox!.y + titleBox!.height - 1);
  }
});
