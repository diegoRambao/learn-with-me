import { noteIdFromEntryId } from './note-path';

export const categoryLevels = ['beginner', 'intermediate', 'advanced', 'pro'] as const;

export type CategoryLevel = (typeof categoryLevels)[number];

export type Category = Readonly<{
  id: string;
  name: string;
  description: string;
  image: string;
  level: CategoryLevel;
  topics: ReadonlyArray<NavigationTopic>;
}>;

export type NavigationTopic = Readonly<{
  id: string;
  name: string;
  position: number;
}>;

type NoteBase = Readonly<{
  id: string;
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  category: string;
  durationMinutes: number;
  position: number;
  topic?: string;
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
  previousNote: Note | null;
  nextNote: Note | null;
  navigationItems: ReadonlyArray<NavigationItem>;
  activeTopicId: string | null;
}>;

export type TopicNavigationItem = Readonly<{
  kind: 'topic';
  topic: NavigationTopic;
  notes: ReadonlyArray<Note>;
}>;

export type UngroupedNoteNavigationItem = Readonly<{
  kind: 'note';
  note: Note;
}>;

export type NavigationItem = TopicNavigationItem | UngroupedNoteNavigationItem;

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
  const activeNoteIndex = activeNote ? routeNotes.findIndex(({ id }) => id === activeNote.id) : -1;
  const previousNote = activeNoteIndex > 0 ? routeNotes[activeNoteIndex - 1] : null;
  const nextNote = activeNoteIndex >= 0 ? routeNotes[activeNoteIndex + 1] ?? null : null;
  const navigationItems: ReadonlyArray<NavigationItem> = [
    ...category.topics.map((topic): TopicNavigationItem => ({
      kind: 'topic',
      topic,
      notes: routeNotes.filter((note) => note.topic === topic.id),
    })),
    ...routeNotes.filter((note) => !note.topic).map((note): UngroupedNoteNavigationItem => ({ kind: 'note', note })),
  ].sort((left, right) => {
    const leftPosition = left.kind === 'topic' ? left.topic.position : left.note.position;
    const rightPosition = right.kind === 'topic' ? right.topic.position : right.note.position;
    if (leftPosition !== rightPosition) return leftPosition - rightPosition;
    const leftId = left.kind === 'topic' ? left.topic.id : left.note.id;
    const rightId = right.kind === 'topic' ? right.topic.id : right.note.id;
    return leftId.localeCompare(rightId);
  });

  return {
    category,
    notes: routeNotes,
    activeNote,
    previousNote,
    nextNote,
    navigationItems,
    activeTopicId: activeNote?.topic ?? null,
  };
};

export const categoryFromEntry = (entry: Readonly<{ id: string; data: Omit<Category, 'id'> }>): Category =>
  ({ id: entry.id, ...entry.data });

export const noteFromEntry = (entry: Readonly<{ id: string; data: Omit<Note, 'id' | 'body'>; body?: string }>): Note =>
  ({ id: noteIdFromEntryId(entry.id), ...entry.data, body: entry.body ?? '' }) as Note;
