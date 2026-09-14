export const categoryLevels = ['beginner', 'intermediate', 'advanced', 'pro'] as const;

export type CategoryLevel = (typeof categoryLevels)[number];

export type Category = Readonly<{
  id: string;
  name: string;
  image: string;
  level: CategoryLevel;
}>;

type NoteBase = Readonly<{
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  position: number;
  body: string;
}>;

export type WrittenNote = NoteBase & Readonly<{
  format: 'written';
  youtubeVideoId?: never;
}>;

export type VideoNote = NoteBase & Readonly<{
  format: 'video';
  youtubeVideoId: string;
}>;

export type Note = WrittenNote | VideoNote;

export type HomeCategoryIndex = Readonly<{
  categories: ReadonlyArray<Category>;
  destination: Readonly<Record<string, string>>;
}>;

export type HomeCategoryPreview = Readonly<{
  primary: ReadonlyArray<Category>;
  teaser: ReadonlyArray<Category>;
}>;

export type LearningRoute = Readonly<{
  category: Category;
  notes: ReadonlyArray<Note>;
  activeNote: Note | null;
}>;

export type CategoryFilter = Readonly<{
  selectedLevel: 'all' | CategoryLevel;
  matchingCount: number;
}>;

export type MotionPreference = Readonly<{
  reducedMotion: boolean;
}>;

export const levelLabels: Readonly<Record<CategoryLevel, string>> = {
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  pro: 'Pro',
};

const normalizeName = (name: string): string =>
  name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');

export const createHomeCategoryIndex = (categories: ReadonlyArray<Category>): HomeCategoryIndex => {
  const orderedCategories = [...categories].sort((left, right) =>
    normalizeName(left.name).localeCompare(normalizeName(right.name), 'es') || left.id.localeCompare(right.id),
  );

  return {
    categories: orderedCategories,
    destination: Object.fromEntries(orderedCategories.map(({ id }) => [id, `/categorias/${id}/`])),
  };
};

export const createHomeCategoryPreview = (categories: ReadonlyArray<Category>): HomeCategoryPreview => ({
  primary: categories.slice(0, 3),
  teaser: categories.slice(3, 6),
});

export const createLearningRoute = (
  category: Category,
  notes: ReadonlyArray<Note>,
  activeNoteId?: string,
): LearningRoute => {
  const routeNotes = notes
    .filter((note) => note.category === category.id)
    .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id));
  const activeNote = activeNoteId
    ? routeNotes.find(({ id }) => id === activeNoteId) ?? null
    : routeNotes[0] ?? null;

  return { category, notes: routeNotes, activeNote };
};

export const categoryFromEntry = (entry: Readonly<{ id: string; data: Omit<Category, 'id'> }>): Category =>
  ({ id: entry.id, ...entry.data });

export const noteFromEntry = (entry: Readonly<{ id: string; data: Omit<Note, 'id' | 'body'>; body?: string }>): Note =>
  ({ id: entry.id, ...entry.data, body: entry.body ?? '' }) as Note;
