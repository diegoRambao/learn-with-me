import { describe, expect, it } from 'vitest';
import { createHomeCategoryPreview, type Category } from '../../src/lib/content';

const createCategories = (count: number): ReadonlyArray<Category> =>
  Array.from({ length: count }, (_, index) => ({
    id: `topic-${index + 1}`,
    name: `Topic ${index + 1}`,
    image: `/images/categories/topic-${index + 1}.svg`,
    level: 'beginner' as const,
  }));

describe('createHomeCategoryPreview', () => {
  it.each([
    { count: 0, primary: 0, teaser: 0 },
    { count: 1, primary: 1, teaser: 0 },
    { count: 2, primary: 2, teaser: 0 },
    { count: 3, primary: 3, teaser: 0 },
    { count: 4, primary: 3, teaser: 1 },
    { count: 5, primary: 3, teaser: 2 },
    { count: 6, primary: 3, teaser: 3 },
    { count: 7, primary: 3, teaser: 3 },
  ])('projects $count categories as $primary + $teaser', ({ count, primary, teaser }) => {
    const preview = createHomeCategoryPreview(createCategories(count));

    expect(preview.primary).toHaveLength(primary);
    expect(preview.teaser).toHaveLength(teaser);
  });

  it('preserves order and references without duplicates or placeholders', () => {
    const categories = createCategories(7);
    const preview = createHomeCategoryPreview(categories);
    const visibleCategories = [...preview.primary, ...preview.teaser];

    expect(visibleCategories).toEqual(categories.slice(0, 6));
    expect(new Set(visibleCategories.map(({ id }) => id))).toHaveProperty('size', 6);
    expect(visibleCategories.every((category) => categories.includes(category))).toBe(true);
  });

  it('does not mutate the source array', () => {
    const categories = createCategories(7);
    const snapshot = [...categories];

    createHomeCategoryPreview(categories);

    expect(categories).toEqual(snapshot);
  });
});

