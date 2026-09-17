import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export type AdminRepositoryFixture = Readonly<{
  root: string;
  write(relativePath: string, contents: string | Uint8Array): Promise<void>;
  read(relativePath: string): Promise<string>;
  cleanup(): Promise<void>;
}>;

const defaultCategory = JSON.stringify({
  name: 'Dart',
  description: 'Aprende Dart',
  image: '/images/categories/dart.svg',
  level: 'beginner',
  topics: [{ id: 'fundamentos', name: 'Fundamentos', position: 1 }],
}, null, 2) + '\n';

const defaultNote = `---
title: Introducción
description: Una nota inicial
tags:
  - dart
category: dart
durationMinutes: 5
position: 2
format: written
topic: fundamentos
customKey: conservar
---

# Hola
`;

export const createAdminRepository = async (
  files: Readonly<Record<string, string | Uint8Array>> = {},
): Promise<AdminRepositoryFixture> => {
  const root = await mkdtemp(join(tmpdir(), 'content-admin-test-'));
  const allFiles: Readonly<Record<string, string | Uint8Array>> = {
    'src/content/categories/dart.json': defaultCategory,
    'src/content/notes/dart/intro.md': defaultNote,
    ...files,
  };

  const write = async (relativePath: string, contents: string | Uint8Array): Promise<void> => {
    const destination = join(root, relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await writeFile(destination, contents);
  };

  await Promise.all(Object.entries(allFiles).map(([relativePath, contents]) => write(relativePath, contents)));

  return {
    root,
    write,
    read: (relativePath) => readFile(join(root, relativePath), 'utf8'),
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
};
