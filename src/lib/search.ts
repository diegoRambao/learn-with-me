import { type Category, createHomeCategoryIndex, type Note } from './content';
import { categoryUrl, noteUrl } from './routes';

export type SearchQuery = Readonly<{
  raw: string;
  trimmed: string;
  tokens: ReadonlyArray<string>;
  status: 'initial' | 'invalid' | 'valid';
}>;

type SearchRecord = Readonly<{
  id: string;
  searchableFields: ReadonlyArray<string>;
}>;

export type SearchCategoryRecord = SearchRecord & Readonly<{
  type: 'category';
  name: string;
  description: string;
  image: string;
  href: string;
}>;

export type SearchNoteRecord = SearchRecord & Readonly<{
  type: 'note';
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  categoryId: string;
  categoryName: string;
  image: string;
  href: string;
}>;

export type SearchIndex = Readonly<{
  categories: ReadonlyArray<SearchCategoryRecord>;
  notes: ReadonlyArray<SearchNoteRecord>;
}>;

export type SearchResults = SearchIndex & Readonly<{ total: number }>;

export const normalizeSearchText = (value: string): string =>
  value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');

const tokenize = (value: string): ReadonlyArray<string> =>
  [...new Set(value.split(/\s+/u).map(normalizeSearchText).filter(Boolean))];

export const parseSearchQuery = (rawValue: string | null): SearchQuery => {
  if (rawValue === null) return { raw: '', trimmed: '', tokens: [], status: 'initial' };
  const trimmed = rawValue.trim();
  return trimmed
    ? { raw: rawValue, trimmed, tokens: tokenize(trimmed), status: 'valid' }
    : { raw: rawValue, trimmed, tokens: [], status: 'invalid' };
};

const createSearchableFields = (values: ReadonlyArray<string>): ReadonlyArray<string> =>
  values.map(normalizeSearchText);

export const buildSearchIndex = (
  categories: ReadonlyArray<Category>,
  notes: ReadonlyArray<Note>,
): SearchIndex => {
  const orderedCategories = createHomeCategoryIndex(categories).categories;
  const categoriesById = new Map(orderedCategories.map((category) => [category.id, category]));
  const categoryRecords = orderedCategories.map((category): SearchCategoryRecord => ({
    type: 'category',
    id: category.id,
    name: category.name,
    description: category.description,
    image: category.image,
    href: categoryUrl(category.id),
    searchableFields: createSearchableFields([category.name, category.description]),
  }));
  const noteRecords = [...notes]
    .filter((note) => categoriesById.has(note.category))
    .sort((left, right) => {
      const categoryOrder = orderedCategories.findIndex(({ id }) => id === left.category) - orderedCategories.findIndex(({ id }) => id === right.category);
      return categoryOrder || left.position - right.position || left.id.localeCompare(right.id);
    })
    .map((note): SearchNoteRecord => {
      const category = categoriesById.get(note.category)!;
      return {
        type: 'note',
        id: note.id,
        title: note.title,
        description: note.description,
        tags: note.tags,
        categoryId: category.id,
        categoryName: category.name,
        image: category.image,
        href: noteUrl(category.id, note.id),
        searchableFields: createSearchableFields([note.title, note.description, ...note.tags]),
      };
    });
  return { categories: categoryRecords, notes: noteRecords };
};

const matchesQuery = (record: SearchRecord, query: SearchQuery): boolean =>
  query.tokens.every((token) => record.searchableFields.some((field) => field.includes(token)));

export const search = (index: SearchIndex, query: SearchQuery): SearchResults => {
  if (query.status !== 'valid') return { categories: [], notes: [], total: 0 };
  const categories = index.categories.filter((record) => matchesQuery(record, query));
  const notes = index.notes.filter((record) => matchesQuery(record, query));
  return { categories, notes, total: categories.length + notes.length };
};
