import { describe, expect, it } from 'vitest';
import { buildSearchIndex, parseSearchQuery, search } from '../../src/lib/search';

const index = buildSearchIndex(
  [
    { id: 'css', name: 'Categoría CSS', description: 'Diseño y animaciones', image: '/css.svg', level: 'beginner', topics: [] },
    { id: 'dart', name: 'Dart', description: 'Lenguaje de programación', image: '/dart.svg', level: 'beginner', topics: [] },
  ],
  [
    { id: 'intro', title: 'Animaciones con CSS', description: 'Una introducción visual', tags: ['css', 'diseño'], category: 'css', durationMinutes: 5, position: 1, format: 'written', body: 'contenido no buscable' },
    { id: 'types', title: 'Tipos de Dart', description: 'Estados válidos', tags: ['null-safety'], category: 'dart', durationMinutes: 5, position: 1, format: 'written', body: 'css oculto' },
  ],
);

describe('parseSearchQuery', () => {
  it('normalizes case and diacritics while preserving the raw query', () => {
    expect(parseSearchQuery('  CATEGORÍA  css css  ')).toEqual({ raw: '  CATEGORÍA  css css  ', trimmed: 'CATEGORÍA  css css', tokens: ['categoria', 'css'], status: 'valid' });
  });

  it('distinguishes missing and blank URL parameters', () => {
    expect(parseSearchQuery(null).status).toBe('initial');
    expect(parseSearchQuery('   ')).toEqual({ raw: '   ', trimmed: '', tokens: [], status: 'invalid' });
  });
});

describe('search', () => {
  it('uses partial AND matching across independent fields without searching Markdown bodies', () => {
    expect(search(index, parseSearchQuery('css anima')).notes.map(({ id }) => id)).toEqual(['intro']);
    expect(search(index, parseSearchQuery('css oculto')).notes).toEqual([]);
  });

  it('returns each matching entity once and preserves canonical category and note order', () => {
    const results = search(index, parseSearchQuery('css'));
    expect(results.categories.map(({ id }) => id)).toEqual(['css']);
    expect(results.notes.map(({ id }) => id)).toEqual(['intro']);
    expect(results.total).toBe(2);
  });

  it('treats visible non-diacritic characters literally', () => {
    expect(search(index, parseSearchQuery('c+s')).total).toBe(0);
  });
});
