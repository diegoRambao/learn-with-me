import { describe, expect, it } from 'vitest';
import { createHomeCategoryIndex, createLearningRoute } from '../../src/lib/content';

const categories = [
  { id: 'zeta', name: 'Álgebra', image: '/images/categories/zeta.svg', level: 'advanced' as const },
  { id: 'algebra', name: 'Algebra', image: '/images/categories/algebra.svg', level: 'beginner' as const },
];

const notes = [
  { id: 'third', title: 'Tercera', description: 'Tercera nota', category: 'algebra', durationMinutes: 3, position: 3, format: 'written' as const, body: 'C' },
  { id: 'first-b', title: 'Primera B', description: 'Primera nota B', category: 'algebra', durationMinutes: 3, position: 1, format: 'written' as const, body: 'B' },
  { id: 'first-a', title: 'Primera A', description: 'Primera nota A', category: 'algebra', durationMinutes: 3, position: 1, format: 'written' as const, body: 'A' },
];

describe('content ordering', () => {
  it('orders categories by normalized name and id', () => {
    expect(createHomeCategoryIndex(categories).categories.map(({ id }) => id)).toEqual(['algebra', 'zeta']);
  });

  it('filters a route and orders notes by position then id', () => {
    const route = createLearningRoute(categories[1], notes);
    expect(route.notes.map(({ id }) => id)).toEqual(['first-a', 'first-b', 'third']);
    expect(route.activeNote?.id).toBe('first-a');
  });

  it('returns an empty route when a category has no notes', () => {
    expect(createLearningRoute(categories[0], notes)).toMatchObject({ notes: [], activeNote: null });
  });

  it('selects only an active note that belongs to the category', () => {
    expect(createLearningRoute(categories[1], notes, 'third').activeNote?.id).toBe('third');
    expect(createLearningRoute(categories[1], notes, 'missing').activeNote).toBeNull();
  });
});

