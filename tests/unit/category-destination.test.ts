import { describe, expect, it } from 'vitest';
import { categoryDestination } from '../../src/lib/routes';

describe('categoryDestination', () => {
  it('links a category to its first note', () => {
    expect(categoryDestination('dart', [
      { id: 'second', category: 'dart', position: 2 },
      { id: 'first', category: 'dart', position: 1 },
    ])).toBe('/categorias/dart/first/');
  });

  it('uses the note id to break ties and keeps empty categories reachable', () => {
    expect(categoryDestination('dart', [
      { id: 'zeta', category: 'dart', position: 1 },
      { id: 'alpha', category: 'dart', position: 1 },
    ])).toBe('/categorias/dart/alpha/');
    expect(categoryDestination('empty', [])).toBe('/categorias/empty/');
  });
});
