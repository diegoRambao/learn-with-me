import type { CategoryDocument, EditingDraft } from '../contracts';

export type NoteDraftValues = Readonly<{
  id: string;
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  category: string;
  topic: string;
  durationMinutes: number;
  position: number;
  format: 'written' | 'video';
  body: string;
  youtubeVideoId: string;
  uploadTokens: ReadonlyArray<string>;
}>;

export type NoteDraft = EditingDraft<NoteDraftValues>;

const defaults: NoteDraftValues = {
  id: '', title: '', description: '', tags: [], category: '', topic: '', durationMinutes: 5,
  position: 1, format: 'written', body: '', youtubeVideoId: '', uploadTokens: [],
};

export const createNoteDraft = (values: Partial<NoteDraftValues> = {}, options: Readonly<{
  identity?: Readonly<Record<string, string>>;
  baseRevision?: string | null;
}> = {}): NoteDraft => ({
  kind: 'note',
  ...(options.identity ? { identity: options.identity } : {}),
  baseRevision: options.baseRevision ?? null,
  values: { ...defaults, ...values },
  dirty: false,
  fieldIssues: {},
  pendingUploads: values.uploadTokens ?? [],
});

export const updateNoteDraft = (draft: NoteDraft, changes: Partial<NoteDraftValues>): NoteDraft => {
  const values = { ...draft.values, ...changes };
  return {
    ...draft,
    values,
    dirty: true,
    fieldIssues: Object.fromEntries(Object.entries(draft.fieldIssues).filter(([field]) => !(field in changes))),
    pendingUploads: values.uploadTokens,
  };
};

const addIssue = (issues: Record<string, string[]>, field: string, message: string): void => {
  issues[field] = [...(issues[field] ?? []), message];
};

export const validateNoteDraft = (draft: NoteDraft, categories: ReadonlyArray<CategoryDocument>): NoteDraft => {
  const { values } = draft;
  const issues: Record<string, string[]> = {};
  if (!values.title.trim()) addIssue(issues, 'title', 'Añade un título.');
  if (!values.description.trim()) addIssue(issues, 'description', 'Añade una descripción.');
  if (values.tags.length === 0 || values.tags.some((tag) => !tag.trim())) addIssue(issues, 'tags', 'Añade al menos una etiqueta.');
  const category = categories.find(({ id }) => id === values.category);
  if (!category) addIssue(issues, 'category', 'Selecciona una categoría existente.');
  if (values.topic && !category?.topics.some(({ id }) => id === values.topic)) addIssue(issues, 'topic', 'Selecciona un tema de la categoría elegida.');
  if (!Number.isInteger(values.durationMinutes) || values.durationMinutes <= 0) addIssue(issues, 'durationMinutes', 'Usa un entero mayor que cero.');
  if (!Number.isInteger(values.position) || values.position <= 0) addIssue(issues, 'position', 'Usa un entero mayor que cero.');
  if (values.format === 'written' && !values.body.trim()) addIssue(issues, 'body', 'Añade contenido Markdown.');
  if (values.format === 'video' && !/^[A-Za-z0-9_-]{11}$/.test(values.youtubeVideoId)) addIssue(issues, 'youtubeVideoId', 'Usa un ID de YouTube de 11 caracteres.');
  return { ...draft, fieldIssues: issues };
};

export const changeNoteFormat = (
  draft: NoteDraft,
  format: NoteDraftValues['format'],
  confirmed: boolean,
): Readonly<{ draft: NoteDraft; changed: boolean; requiresConfirmation: boolean }> => {
  if (draft.values.format === format) return { draft, changed: false, requiresConfirmation: false };
  const discardsData = (format === 'video' && Boolean(draft.values.body.trim()))
    || (format === 'written' && Boolean(draft.values.youtubeVideoId.trim()));
  if (discardsData && !confirmed) return { draft, changed: false, requiresConfirmation: true };
  const changed = updateNoteDraft(draft, format === 'video'
    ? { format, body: '', uploadTokens: [] }
    : { format, youtubeVideoId: '' });
  return { draft: changed, changed: true, requiresConfirmation: false };
};
