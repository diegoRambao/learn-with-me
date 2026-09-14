import { expect, test } from '@playwright/test';

test('renders Markdown metadata and content', async ({ page }) => {
  await page.goto('/categorias/dart/dart-types/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tipos que explican la intención');
  await expect(page.getByText('10 minutos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Modelar antes de implementar' })).toBeVisible();
});

test('renders a safe lazy video and an external fallback', async ({ page }) => {
  await page.goto('/categorias/dart/dart-video/');
  const frame = page.getByTitle('Video: Dart en una sesión práctica');
  await expect(frame).toHaveAttribute('src', 'https://www.youtube.com/embed/M7lc1UVf-VE');
  await expect(frame).toHaveAttribute('loading', 'lazy');
  await expect(frame).toHaveAttribute('allowfullscreen', '');
  await expect(page.getByRole('link', { name: /directamente en YouTube/ })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=M7lc1UVf-VE');
});

test('redirects an unrelated category and note pair without exposing content', async ({ page }) => {
  await page.goto('/categorias/flutter/dart-types/');
  await expect(page).toHaveURL(/\/categorias\/\?notice=invalid-note-context$/);
  await expect(page.getByText('No pudimos abrir esa nota porque la categoría no es válida.')).toBeVisible();
  await expect(page.getByText('Modelar antes de implementar')).toHaveCount(0);
});

test('redirects a note URL that lacks category context', async ({ page }) => {
  await page.goto('/notas/dart-types/');
  await expect(page).toHaveURL(/\/categorias\/\?notice=invalid-note-context$/);
});

