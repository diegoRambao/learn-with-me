const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const requireSlug = (value: string, label: string): string => {
  if (!slugPattern.test(value)) throw new Error(`${label} must be a URL-safe slug`);
  return value;
};

export const categoryUrl = (categoryId: string): string =>
  `/categorias/${requireSlug(categoryId, 'categoryId')}/`;

export const noteUrl = (categoryId: string, noteId: string): string =>
  `${categoryUrl(categoryId)}${requireSlug(noteId, 'noteId')}/`;

export const isValidCategoryNotePair = (
  categoryId: string,
  note: Readonly<{ category: string }>,
): boolean => note.category === categoryId;

