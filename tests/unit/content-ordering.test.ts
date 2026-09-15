import { describe, expect, it } from 'vitest';
import { createHomeCategoryIndex, createLearningRoute, noteFromEntry } from '../../src/lib/content';

const categories = [
  { id: 'zeta', name: 'Álgebra', description: 'Álgebra avanzada', image: '/images/categories/zeta.svg', level: 'advanced' as const },
  { id: 'algebra', name: 'Algebra', description: 'Álgebra inicial', image: '/images/categories/algebra.svg', level: 'beginner' as const },
];

const notes = [
  { id: 'third', title: 'Tercera', description: 'Tercera nota', tags: ['algebra'], category: 'algebra', durationMinutes: 3, position: 3, format: 'written' as const, body: 'C' },
  { id: 'first-b', title: 'Primera B', description: 'Primera nota B', tags: ['algebra'], category: 'algebra', durationMinutes: 3, position: 1, format: 'written' as const, body: 'B' },
  { id: 'first-a', title: 'Primera A', description: 'Primera nota A', tags: ['algebra'], category: 'algebra', durationMinutes: 3, position: 1, format: 'written' as const, body: 'A' },
];

describe('content ordering', () => {
  it('projects a nested content entry to its public note id', () => {
    const { id: _id, body, ...data } = notes[0];
    const entry = { id: 'guides/intro', data, body };

    expect(noteFromEntry(entry).id).toBe('intro');
  });

  it('orders categories by normalized name and id', () => {
    expect(createHomeCategoryIndex(categories).categories.map(({ id }) => id)).toEqual(['algebra', 'zeta']);
  });

  it('filters a route and orders notes by position then id', () => {
    const route = createLearningRoute(categories[1], notes);
    expect(route.notes.map(({ id }) => id)).toEqual(['first-a', 'first-b', 'third']);
    expect(route.activeNote?.id).toBe('first-a');
    expect(route.previousNote).toBeNull();
    expect(route.nextNote?.id).toBe('first-b');
  });

  it('returns an empty route when a category has no notes', () => {
    expect(createLearningRoute(categories[0], notes)).toMatchObject({ notes: [], activeNote: null });
  });

  it('selects only an active note that belongs to the category', () => {
    const middleRoute = createLearningRoute(categories[1], notes, 'first-b');
    expect(middleRoute.activeNote?.id).toBe('first-b');
    expect(middleRoute.previousNote?.id).toBe('first-a');
    expect(middleRoute.nextNote?.id).toBe('third');

    const lastRoute = createLearningRoute(categories[1], notes, 'third');
    expect(lastRoute.previousNote?.id).toBe('first-b');
    expect(lastRoute.nextNote).toBeNull();

    const invalidRoute = createLearningRoute(categories[1], notes, 'missing');
    expect(invalidRoute.activeNote).toBeNull();
    expect(invalidRoute.previousNote).toBeNull();
    expect(invalidRoute.nextNote).toBeNull();
  });

  it('keeps category routes immutable and supports video neighbors with discontinuous positions', () => {
    const sourceNotes = [
      { ...notes[0], position: 30 },
      { ...notes[1], position: 10, format: 'video' as const, youtubeVideoId: 'video-id' },
      { ...notes[2], position: 20 },
      { id: 'other', title: 'Otra', description: 'Otra nota', tags: ['algebra'], category: 'zeta', durationMinutes: 1, position: 1, format: 'written' as const, body: '' },
    ];
    const originalOrder = sourceNotes.map(({ id }) => id);
    const route = createLearningRoute(categories[1], sourceNotes, 'first-a');

    expect(route.notes.map(({ id }) => id)).toEqual(['first-b', 'first-a', 'third']);
    expect(route.previousNote?.format).toBe('video');
    expect(route.nextNote?.id).toBe('third');
    expect(sourceNotes.map(({ id }) => id)).toEqual(originalOrder);
  });
});
