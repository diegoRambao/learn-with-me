import matter from 'gray-matter';

type CategoryFields = Readonly<{
  name: string;
  description: string;
  image: string;
  level: string;
  topics: ReadonlyArray<Readonly<{ id: string; name: string; position: number }>>;
}>;

type NoteFields = Readonly<{
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  category: string;
  topic?: string;
  durationMinutes: number;
  position: number;
  format: 'written' | 'video';
  youtubeVideoId?: string;
}>;

const definedEntries = (value: Readonly<Record<string, unknown>>): Readonly<Record<string, unknown>> =>
  Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== undefined));

export const serializeCategoryDocument = (original: string | null, changes: Partial<CategoryFields>): string => {
  const current = original ? JSON.parse(original) as Record<string, unknown> : {};
  return `${JSON.stringify({ ...current, ...definedEntries(changes) }, null, 2)}\n`;
};

export const serializeNoteDocument = (
  original: string | null,
  changes: Partial<NoteFields>,
  body: string,
): string => {
  const parsed = original ? matter(original) : { data: {}, content: '' };
  const data: Record<string, unknown> = { ...parsed.data, ...definedEntries(changes) };
  if (data.topic === undefined || data.topic === '') delete data.topic;
  if (data.format === 'written') delete data.youtubeVideoId;
  const serializedBody = data.format === 'video' ? '' : body.trimEnd();
  return matter.stringify(serializedBody ? `\n${serializedBody}\n` : '', data);
};
