import { describe, expect, it } from 'vitest';
import { categoryDestination } from '../../src/lib/routes';

describe('categoryDestination', () => {
  it('links a category to its first note', () => {
    const notes = [
      { id: 'second', category: 'dart', position: 2 },
      { id: 'first', category: 'dart', position: 1 },
    ];

    expect(categoryDestination('dart', notes)).toBe('/categorias/dart/first/');
    expect(notes.map(({ id }) => id)).toEqual(['second', 'first']);
  });

  it('uses the note id to break ties and keeps empty categories reachable', () => {
    expect(categoryDestination('dart', [
      { id: 'zeta', category: 'dart', position: 1 },
      { id: 'alpha', category: 'dart', position: 1 },
    ])).toBe('/categorias/dart/alpha/');
    expect(categoryDestination('empty', [])).toBe('/categorias/empty/');
  });
});
