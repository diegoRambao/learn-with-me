const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type CategorizedNote = Readonly<{
  id: string;
  category: string;
  position: number;
}>;

const requireSlug = (value: string, label: string): string => {
  if (!slugPattern.test(value)) throw new Error(`${label} must be a URL-safe slug`);
  return value;
};

export const categoryUrl = (categoryId: string): string =>
  `/categorias/${requireSlug(categoryId, 'categoryId')}/`;

export const noteUrl = (categoryId: string, noteId: string): string =>
  `${categoryUrl(categoryId)}${requireSlug(noteId, 'noteId')}/`;

export const categoryDestination = (
  categoryId: string,
  notes: ReadonlyArray<CategorizedNote>,
): string => {
  const firstNote = notes
    .filter((note) => note.category === categoryId)
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))[0];

  return firstNote ? noteUrl(categoryId, firstNote.id) : categoryUrl(categoryId);
};

export const isValidCategoryNotePair = (
  categoryId: string,
  note: Readonly<{ category: string }>,
): boolean => note.category === categoryId;
