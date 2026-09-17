import type { NoteDocument } from '../contracts';

export type ContentFilters = Readonly<{
  query: string;
  category: string;
  topic: string;
  tag: string;
}>;

export const normalizeContentQuery = (value: string): string => value
  .trim()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')
  .toLocaleLowerCase('es');

export const filterContent = (
  notes: ReadonlyArray<NoteDocument>,
  filters: ContentFilters,
): ReadonlyArray<NoteDocument> => {
  const query = normalizeContentQuery(filters.query);
  const tag = normalizeContentQuery(filters.tag);
  return notes.filter((note) => (
    (!filters.category || note.category === filters.category)
    && (!filters.topic || note.topic === filters.topic)
    && (!query || normalizeContentQuery(note.title).includes(query))
    && (!tag || note.tags.some((value) => normalizeContentQuery(value) === tag))
  ));
};
