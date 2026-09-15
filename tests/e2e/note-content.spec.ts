import { expect, test } from '@playwright/test';

test('renders Markdown metadata and content', async ({ page }) => {
  await page.goto('/categorias/dart/dart-types/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tipos que explican la intención');
  await expect(page.getByText('10 minutos')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Modelar antes de implementar' })).toBeVisible();
});

test('renders a relative image after its note is grouped', async ({ page }) => {
  await page.goto('/categorias/design-patterns/pattern-design-factory-method/');
  const image = page.locator('.note-prose img').first();
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', /20260915_085815_factory-method/);
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

test('styles standard and GFM Markdown without page overflow', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/categorias/dart/dart-function/');
  await page.locator('.note-prose').evaluate((element) => {
    element.insertAdjacentHTML('beforeend', `
      <div data-markdown-fixture><h1>Encabezado 1</h1><h2>Encabezado 2</h2><h3>Encabezado 3</h3><h4>Encabezado 4</h4><h5>Encabezado 5</h5><h6>Encabezado 6</h6>
      <p><strong>Negrita</strong> <em>Énfasis</em> <del>Tachado</del> <a href="/categorias/dart/">Enlace interno</a> <code>inline</code></p>
      <blockquote>Cita de prueba</blockquote><ul><li>Raíz<ul><li>Anidada</li></ul></li></ul>
      <ul><li class="task-list-item"><input type="checkbox" checked disabled>Completada</li><li class="task-list-item"><input type="checkbox" disabled>Pendiente</li></ul>
      <img alt="Imagen de prueba" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==">
      <table><thead><tr><th>Columna</th><th>Valor</th></tr></thead><tbody><tr><td>Etiqueta muy larga para comprobar desplazamiento local</td><td>Dato</td></tr></tbody></table>
      <pre><code>const veryLongLine = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";</code></pre></div>`);
  });
  const prose = page.locator('.note-prose');
  const fixture = prose.locator('[data-markdown-fixture]');
  const headingSizes = await fixture.locator('h1, h2, h3, h4, h5, h6').evaluateAll((headings) => headings.map((heading) => Number.parseFloat(getComputedStyle(heading).fontSize)));
  expect(headingSizes).toHaveLength(6);
  expect(headingSizes.every((size, index) => index === 0 || headingSizes[index - 1] > size)).toBe(true);
  expect(await fixture.locator('ul').count()).toBeGreaterThan(1);
  await expect(fixture.locator('blockquote')).toBeVisible();
  await expect(fixture.locator('del')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(fixture.locator('img')).toBeVisible();
  await expect(fixture.locator('input[type="checkbox"]')).toHaveCount(2);
  await expect(fixture.locator('table')).toBeVisible();
  expect(await fixture.locator('pre code').count()).toBeGreaterThan(0);
  expect(await page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true);
  expect(await fixture.locator('pre').evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('adds independent accessible copy controls and selects intact code when copying fails', async ({ page }) => {
  await page.goto('/categorias/dart/dart-function/');
  const codeBlocks = page.locator('.note-prose pre > code');
  const copyButtons = page.getByRole('button', { name: /Copiar bloque de código/ });
  await expect(copyButtons).toHaveCount(await codeBlocks.count());
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied'); } } }));
  await copyButtons.first().focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/No se pudo copiar automáticamente/)).toBeVisible();
  await expect(page.locator('.note-prose pre').first()).toContainText(await codeBlocks.first().textContent() ?? '');
  expect(await page.evaluate(() => getSelection()?.toString().length ?? 0)).toBeGreaterThan(0);
});

test('keeps Markdown links visibly interactive in both themes', async ({ page }) => {
  await page.goto('/categorias/dart/dart-function/');
  const link = page.locator('.note-prose a').first();
  await expect(link).toHaveAttribute('href', 'https://dart.dev/language/functions');
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
  await page.locator('html').evaluate((element) => { element.dataset.theme = 'dark'; });
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
});
