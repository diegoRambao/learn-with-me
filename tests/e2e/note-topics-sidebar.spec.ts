import { expect, test } from '@playwright/test';

const route = '/categorias/flutter-basic/flutter-basic-intro/';

test('renders ordered root items, active topic, ungrouped notes, and an empty topic', async ({ page }) => {
  await page.goto(route);
  const navigation = page.getByRole('navigation', { name: 'Notas de Flutter Basico' });
  const topics = navigation.locator('details[data-topic-id]');

  await expect(topics).toHaveCount(3);
  await expect(topics.nth(0)).toHaveAttribute('open', '');
  await expect(topics.nth(1)).not.toHaveAttribute('open', '');
  await expect(navigation.getByRole('link', { name: /Primeros pasos con Flutter/ })).toHaveAttribute('aria-current', 'page');
  await expect(navigation.getByRole('link', { name: /Composición de widgets/ })).toBeVisible();

  const emptySummary = navigation.locator('[data-topic-id="proximamente"] summary');
  await emptySummary.focus();
  await page.keyboard.press('Enter');
  await expect(navigation.getByText('No hay notas', { exact: true })).toBeVisible();
  await expect(topics.nth(0)).toHaveAttribute('open', '');
});

test('supports keyboard disclosures and keeps multiple topics open', async ({ page }) => {
  await page.goto(route);
  const fundamentals = page.locator('[data-topic-id="fundamentos"]');
  const state = page.locator('[data-topic-id="estado"]');

  await state.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(fundamentals).toHaveAttribute('open', '');
  await expect(state).toHaveAttribute('open', '');
});

test('numbers grouped notes locally, resets each topic, and preserves root note positions', async ({ page }) => {
  await page.goto('/categorias/dart/dart-types/');
  const dartNavigation = page.getByRole('navigation', { name: 'Notas de Dart' });

  await expect(dartNavigation.locator('summary .route-number')).toHaveCount(0);
  await expect(dartNavigation.locator('[data-topic-id="fundamentos"] .route-number')).toHaveText(['01']);
  await expect(dartNavigation.locator('[data-topic-id="practica"] .route-number')).toHaveText(['01']);
  await expect(dartNavigation.locator(':scope > ol > li > a .route-number')).toHaveText(['03']);

  await page.goto('/categorias/terminal/terminal-basic-commands/');
  const terminalNavigation = page.getByRole('navigation', { name: 'Notas de Terminal' });

  await expect(terminalNavigation.locator('summary .route-number')).toHaveCount(0);
  await expect(terminalNavigation.locator('[data-topic-id="fundamentos"] .route-number')).toHaveText(['01', '02', '03']);
});

test('toggles the panel, keeps focus, changes content width, and restores per-category state', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(route);
  const toggle = page.locator('[data-sidebar-toggle]');
  const panel = page.locator('#course-navigation-panel');
  const content = page.locator('.note-workspace-content');
  const hideIcon = toggle.locator('[data-sidebar-icon="hide"]');
  const showIcon = toggle.locator('[data-sidebar-icon="show"]');
  const visibleWidth = (await content.boundingBox())?.width ?? 0;

  await expect(hideIcon).not.toHaveClass(/is-hidden/);
  await expect(showIcon).toHaveClass(/is-hidden/);

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveText('Mostrar panel');
  await expect(toggle).toHaveAttribute('aria-controls', 'course-navigation-panel');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(hideIcon).toHaveClass(/is-hidden/);
  await expect(showIcon).not.toHaveClass(/is-hidden/);
  await expect(panel).toBeHidden();
  expect((await content.boundingBox())?.width ?? 0).toBeGreaterThan(visibleWidth);
  expect(await page.evaluate(() => window.scrollX)).toBe(0);

  await toggle.click();
  await page.locator('[data-topic-id="estado"] summary').click();
  await panel.evaluate((element) => { element.scrollTop = 24; element.dispatchEvent(new Event('scroll')); });
  await page.getByRole('link', { name: /Estado y actualización/ }).click();

  await expect(page.locator('[data-topic-id="fundamentos"]')).toHaveAttribute('open', '');
  await expect(page.locator('[data-topic-id="estado"]')).toHaveAttribute('open', '');
  expect(await panel.evaluate((element) => element.scrollTop)).toBeGreaterThanOrEqual(0);
});

test('uses safe defaults for corrupt or unavailable storage and avoids 320px overflow', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('learning-sidebar:v1:flutter-basic', '{broken'));
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);

  await expect(page.getByRole('button', { name: 'Ocultar panel' })).toBeVisible();
  await expect(page.locator('[data-topic-id="fundamentos"]')).toHaveAttribute('open', '');
  expect(await page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
});

test('keeps navigation usable when sessionStorage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get: () => { throw new Error('blocked'); } });
  });
  await page.goto(route);
  await page.getByRole('button', { name: 'Ocultar panel' }).click();
  await expect(page.getByRole('button', { name: 'Mostrar panel' })).toBeFocused();
  await page.getByRole('button', { name: 'Mostrar panel' }).click();
  await expect(page.getByRole('navigation', { name: 'Notas de Flutter Basico' })).toBeVisible();
});
