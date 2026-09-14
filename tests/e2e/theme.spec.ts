import { expect, test, type Page } from '@playwright/test';

const themeStorageKey = 'learn-with-me-theme';

const pageBackground = (page: Page) => page.evaluate(() =>
  getComputedStyle(document.documentElement).getPropertyValue('--page-background').trim(),
);

test('uses System by default and follows live operating-system changes', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  const selector = page.getByRole('combobox', { name: 'Tema' });
  await expect(selector).toHaveValue('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
  const lightBackground = await pageBackground(page);

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(() => pageBackground(page)).not.toBe(lightBackground);
  await expect(selector).toHaveValue('system');
});

test('persists explicit themes and lets them override the system', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const selector = page.getByRole('combobox', { name: 'Tema' });

  await selector.selectOption('light');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const explicitLightBackground = await pageBackground(page);
  await page.reload();
  await expect(selector).toHaveValue('light');
  await expect.poll(() => pageBackground(page)).toBe(explicitLightBackground);

  await selector.selectOption('dark');
  const explicitDarkBackground = await pageBackground(page);
  expect(explicitDarkBackground).not.toBe(explicitLightBackground);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect.poll(() => pageBackground(page)).toBe(explicitDarkBackground);

  await selector.selectOption('system');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
  await expect.poll(() => pageBackground(page)).toBe(explicitLightBackground);
});

test('normalizes an invalid stored theme to System', async ({ page }) => {
  await page.addInitScript(([key]) => localStorage.setItem(key, 'sepia'), [themeStorageKey]);
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'system');
  await expect(page.getByRole('combobox', { name: 'Tema' })).toHaveValue('system');
});

test('keeps theme selection operable when local storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    for (const method of ['getItem', 'setItem'] as const) {
      Object.defineProperty(Storage.prototype, method, {
        configurable: true,
        value: () => { throw new DOMException('Storage blocked', 'SecurityError'); },
      });
    }
  });
  await page.goto('/');

  const selector = page.getByRole('combobox', { name: 'Tema' });
  await selector.selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.locator('.vite-error-overlay, [data-nextjs-dialog]')).toHaveCount(0);
});

test('exposes all options and remains keyboard operable', async ({ page }) => {
  await page.goto('/');
  const selector = page.getByRole('combobox', { name: 'Tema' });
  await expect(selector.getByRole('option')).toHaveText(['Sistema', 'Claro', 'Oscuro']);
  await page.getByRole('link', { name: 'Categorías', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(selector).toBeFocused();
  await selector.selectOption('dark');
  await expect(selector).toHaveValue('dark');
  await expect(selector).toBeFocused();
});

test('keeps readable foreground contrast across shared pages and themes', async ({ page }) => {
  for (const mode of ['light', 'dark'] as const) {
    await page.goto('/');
    await page.getByRole('combobox', { name: 'Tema' }).selectOption(mode);
    for (const path of ['/', '/categorias/', '/categorias/dart/dart-types/']) {
      await page.goto(path);
      const contrastRatio = await page.evaluate(() => {
        const parse = (color: string) => color.match(/\d+/g)!.slice(0, 3).map(Number);
        const luminance = (color: string) => {
          const channels = parse(color).map((value) => {
            const normalized = value / 255;
            return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
          });
          return .2126 * channels[0] + .7152 * channels[1] + .0722 * channels[2];
        };
        const foreground = luminance(getComputedStyle(document.body).color);
        const background = luminance(getComputedStyle(document.documentElement).backgroundColor);
        return (Math.max(foreground, background) + .05) / (Math.min(foreground, background) + .05);
      });
      expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    }
  }
});
