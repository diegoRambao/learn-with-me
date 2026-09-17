import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const fixtureRoot = join(process.cwd(), '.content-admin/e2e-repository');

export async function setupAdminRepository(): Promise<void> {
  await rm(fixtureRoot, { recursive: true, force: true });
  await mkdir(join(fixtureRoot, 'src/content/categories'), { recursive: true });
  await mkdir(join(fixtureRoot, 'src/content/notes/dart'), { recursive: true });
  await writeFile(join(fixtureRoot, 'src/content/categories/dart.json'), `${JSON.stringify({
    name: 'Dart',
    description: 'Aprende Dart',
    image: '/images/categories/dart.svg',
    level: 'beginner',
    topics: [{ id: 'fundamentos', name: 'Fundamentos', position: 1 }],
  }, null, 2)}\n`);
  await writeFile(join(fixtureRoot, 'src/content/notes/dart/intro.md'), `---
title: Introducción
description: Nota inicial
tags: [dart]
category: dart
durationMinutes: 5
position: 2
format: written
topic: fundamentos
---

# Introducción
`);
  await writeFile(join(fixtureRoot, 'src/content/notes/dart/types.md'), `---
title: Tipos
description: Segunda nota
tags: [dart, tipos]
category: dart
durationMinutes: 6
position: 3
format: written
topic: fundamentos
---

# Tipos
`);
  await writeFile(join(fixtureRoot, 'src/content/notes/dart/broken.md'), '---\ninvalid: [\n---\n');
}

export default setupAdminRepository;
