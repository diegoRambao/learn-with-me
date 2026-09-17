import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { expect, test } from '@playwright/test';

const distRoot = join(process.cwd(), 'dist');

const listFiles = async (directory: string): Promise<ReadonlyArray<string>> => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? listFiles(join(directory, entry.name)) : [join(directory, entry.name)]))).flat();
};

test('public dist excludes admin routes, runtime, assets, and identifiers', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'The public artifact only needs one deterministic isolation pass.');
  const files = await listFiles(distRoot);
  const relativeFiles = files.map((path) => relative(distRoot, path).replaceAll('\\', '/'));
  expect(relativeFiles.some((path) => /(^|\/)(admin|api)(\/|$)/i.test(path))).toBe(false);
  const searchable = await Promise.all(files.filter((path) => /\.(?:html|js|css|json|map|txt)$/i.test(path)).map((path) => readFile(path, 'utf8')));
  const output = searchable.join('\n');
  for (const forbidden of ['.content-admin', 'X-Content-Admin-Token', 'Administrador local', 'trashId', '/api/bootstrap']) {
    expect(output).not.toContain(forbidden);
  }

  const response = await page.goto('/admin');
  expect(response?.status()).toBe(404);
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Lo que estudio/ })).toBeVisible();
  await page.goto('/categorias/');
  await expect(page.getByRole('heading', { name: /Elige el próximo tema/ })).toBeVisible();
});
