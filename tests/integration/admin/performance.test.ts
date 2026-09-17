import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { filterContent } from '../../../admin/src/lib/client/content-filters';
import { PREVIEW_DEBOUNCE_MILLISECONDS, schedulePreviewRefresh } from '../../../admin/src/lib/client/preview-timing';
import { loadContentRepository } from '../../../admin/src/lib/server/content-repository';
import { createNote } from '../../../admin/src/lib/server/note-mutations';

describe('administrative performance budget', () => {
  let repositoryRoot = '';

  beforeAll(async () => {
    repositoryRoot = await mkdtemp(join(tmpdir(), 'content-admin-performance-'));
    const files: Array<readonly [string, string]> = [];
    for (let categoryIndex = 0; categoryIndex < 100; categoryIndex += 1) {
      const categoryId = `category-${categoryIndex}`;
      files.push([
        `src/content/categories/${categoryId}.json`,
        `${JSON.stringify({
          name: `Category ${categoryIndex}`,
          description: `Performance category ${categoryIndex}`,
          image: `/images/categories/${categoryId}.svg`,
          level: 'beginner',
          topics: [],
        })}\n`,
      ]);
      for (let noteIndex = 0; noteIndex < 10; noteIndex += 1) {
        files.push([
          `src/content/notes/${categoryId}/note-${noteIndex}.md`,
          `---\ntitle: Note ${categoryIndex}-${noteIndex}\ndescription: Performance fixture\ntags: [performance]\ncategory: ${categoryId}\ndurationMinutes: 5\nposition: ${noteIndex + 1}\nformat: written\n---\n\n# Note ${categoryIndex}-${noteIndex}\n`,
        ]);
      }
    }
    await Promise.all(files.map(async ([relativePath, contents]) => {
      const destination = join(repositoryRoot, relativePath);
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, contents);
    }));
  }, 30_000);

  afterAll(async () => rm(repositoryRoot, { recursive: true, force: true }));

  it('loads and filters 100 categories with 1,000 notes in under one second', async () => {
    const inventoryStart = performance.now();
    const snapshot = await loadContentRepository(repositoryRoot);
    const inventoryDuration = performance.now() - inventoryStart;
    expect(snapshot.categories).toHaveLength(100);
    expect(snapshot.notes).toHaveLength(1_000);
    expect(inventoryDuration).toBeLessThan(1_000);

    const filterStart = performance.now();
    const matches = filterContent(snapshot.notes, { query: 'Note 99', category: 'category-99', topic: '', tag: 'performance' });
    const filterDuration = performance.now() - filterStart;
    expect(matches).toHaveLength(10);
    expect(filterDuration).toBeLessThan(1_000);
  });

  it('uses an exact 300 ms preview debounce', () => {
    let scheduledDelay = -1;
    let clearedTimer: number | undefined;
    const timer = schedulePreviewRefresh({
      clearTimeout: (handle) => { clearedTimer = handle; },
      setTimeout: (_callback, delay) => { scheduledDelay = delay; return 42; },
    }, 7, () => undefined);
    expect(PREVIEW_DEBOUNCE_MILLISECONDS).toBe(300);
    expect(scheduledDelay).toBe(300);
    expect(clearedTimer).toBe(7);
    expect(timer).toBe(42);
  });

  it('commits an ordinary note mutation in under one second', async () => {
    const mutationStart = performance.now();
    const result = await createNote(repositoryRoot, {
      id: 'new-note',
      title: 'New note',
      description: 'Performance mutation',
      tags: ['performance'],
      category: 'category-0',
      durationMinutes: 5,
      position: 11,
      format: 'written',
      body: '# New note\n',
    });
    const mutationDuration = performance.now() - mutationStart;
    expect(result.changedPaths).toEqual(['src/content/notes/category-0/new-note.md']);
    expect(mutationDuration).toBeLessThan(1_000);
  });
});
