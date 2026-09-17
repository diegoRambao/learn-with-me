import { describe, expect, it } from 'vitest';
import { filterContent, normalizeContentQuery } from '../../../admin/src/lib/client/content-filters';

const notes = [
  { id: 'intro', folder: 'dart', title: 'Introducción á Dart', description: 'x', tags: ['Lenguaje'], category: 'dart', topic: 'fundamentos', durationMinutes: 1, position: 1, format: 'written' as const, body: '# x', managedAssets: [], sourcePath: 'src/content/notes/dart/intro.md', revision: 'a', status: 'active' as const },
  { id: 'astro', folder: 'web', title: 'Astro', description: 'x', tags: ['Web'], category: 'web', durationMinutes: 1, position: 1, format: 'written' as const, body: '# x', managedAssets: [], sourcePath: 'src/content/notes/web/astro.md', revision: 'b', status: 'active' as const },
];

describe('content filters', () => {
  it('combines category, topic, title, and tag without losing filter values', () => {
    const filters = { query: 'introduccion', category: 'dart', topic: 'fundamentos', tag: 'lenguaje' };
    expect(filterContent(notes, filters).map(({ id }) => id)).toEqual(['intro']);
    expect(filters).toEqual({ query: 'introduccion', category: 'dart', topic: 'fundamentos', tag: 'lenguaje' });
  });

  it('normalizes accents and casing and never includes non-active data', () => {
    expect(normalizeContentQuery('  ÁSTRÖ  ')).toBe('astro');
    expect(filterContent(notes, { query: 'dart', category: '', topic: '', tag: '' })).toHaveLength(1);
  });
});
