import { categoryLevels, type CategoryLevel } from './content';

export type ContentValidationIssue = Readonly<{
  sourcePath: string;
  field: string;
  code: string;
  message: string;
}>;

export type CategoryInput = Readonly<{
  sourcePath: string;
  id: unknown;
  name: unknown;
  description: unknown;
  image: unknown;
  level: unknown;
  topics: unknown;
}>;

export type TopicInput = Readonly<{
  id: unknown;
  name: unknown;
  position: unknown;
}>;

export type NoteInput = Readonly<{
  sourcePath: string;
  folder: unknown;
  depth: unknown;
  id: unknown;
  title: unknown;
  description: unknown;
  tags: unknown;
  category: unknown;
  durationMinutes: unknown;
  position: unknown;
  format: unknown;
  youtubeVideoId?: unknown;
  topic?: unknown;
  body?: unknown;
}>;

export type SiteConfigInput = Readonly<{
  socialLinks: ReadonlyArray<Readonly<{ network: unknown; label: unknown; url: unknown }>>;
}>;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const youtubeIdPattern = /^[A-Za-z0-9_-]{11}$/;

const issue = (sourcePath: string, field: string, code: string, message: string): ContentValidationIssue =>
  ({ sourcePath, field, code, message });

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const isPositiveInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value > 0;

const isValidImage = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  if (value.startsWith('/images/categories/')) return value.length > '/images/categories/'.length;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

const isHttpsUrl = (value: unknown): value is string => {
  if (typeof value !== 'string') return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

export const validateCategoryInput = (category: CategoryInput): ContentValidationIssue[] => {
  const issues: ContentValidationIssue[] = [];
  if (!isNonEmptyString(category.id) || !slugPattern.test(category.id)) issues.push(issue(category.sourcePath, 'id', 'invalid_id', 'Usa un ID slug URL-safe derivado del archivo.'));
  if (!isNonEmptyString(category.name)) issues.push(issue(category.sourcePath, 'name', 'empty_name', 'Añade un nombre visible no vacío.'));
  if (!isNonEmptyString(category.description)) issues.push(issue(category.sourcePath, 'description', 'empty_description', 'Añade una descripción no vacía para la categoría.'));
  if (!isValidImage(category.image)) issues.push(issue(category.sourcePath, 'image', 'invalid_image', 'Usa /images/categories/... o una URL HTTPS absoluta.'));
  if (!categoryLevels.includes(category.level as CategoryLevel)) issues.push(issue(category.sourcePath, 'level', 'invalid_level', 'Usa beginner, intermediate, advanced o pro.'));
  if (!Array.isArray(category.topics)) {
    issues.push(issue(category.sourcePath, 'topics', 'invalid_topics', 'Declara topics como un arreglo, aunque esté vacío.'));
    return issues;
  }
  for (const [index, rawTopic] of category.topics.entries()) {
    const topic = rawTopic as Partial<TopicInput>;
    const fieldPrefix = `topics[${index}]`;
    if (!isNonEmptyString(topic.id) || !slugPattern.test(topic.id)) issues.push(issue(category.sourcePath, `${fieldPrefix}.id`, 'invalid_topic_id', 'Usa un ID de tema slug URL-safe no vacío.'));
    if (!isNonEmptyString(topic.name)) issues.push(issue(category.sourcePath, `${fieldPrefix}.name`, 'empty_topic_name', 'Añade un nombre de tema visible no vacío.'));
    if (!isPositiveInteger(topic.position)) issues.push(issue(category.sourcePath, `${fieldPrefix}.position`, 'invalid_topic_position', 'Usa un entero mayor que cero para la posición del tema.'));
  }
  issues.push(...duplicateIssues(
    category.topics as ReadonlyArray<TopicInput>,
    ({ id }) => id,
    () => category.sourcePath,
    'topics.id',
    'duplicate_topic_id',
    'Cada ID de tema debe ser único dentro de la categoría.',
  ));
  return issues;
};

export const validateNoteInput = (note: NoteInput): ContentValidationIssue[] => {
  const issues: ContentValidationIssue[] = [];
  if (note.depth !== 2) {
    issues.push(issue(note.sourcePath, 'location', 'invalid_location', 'Guarda la nota exactamente en src/content/notes/{carpeta}/{id}.md.'));
  } else if (!isNonEmptyString(note.folder) || !slugPattern.test(note.folder)) {
    issues.push(issue(note.sourcePath, 'folder', 'invalid_folder', 'Usa un nombre de carpeta en formato slug.'));
  }
  const fields = [['id', note.id], ['title', note.title], ['description', note.description], ['category', note.category]] as const;
  for (const [field, value] of fields) {
    if (!isNonEmptyString(value)) issues.push(issue(note.sourcePath, field, `invalid_${field}`, `Añade un valor no vacío para ${field}.`));
  }
  if (isNonEmptyString(note.id) && !slugPattern.test(note.id)) issues.push(issue(note.sourcePath, 'id', 'invalid_id', 'Usa un ID slug URL-safe derivado del archivo.'));
  if (!isPositiveInteger(note.durationMinutes)) issues.push(issue(note.sourcePath, 'durationMinutes', 'invalid_duration', 'Usa un entero mayor que cero.'));
  if (!Array.isArray(note.tags) || note.tags.length === 0 || note.tags.some((tag) => !isNonEmptyString(tag))) issues.push(issue(note.sourcePath, 'tags', 'invalid_tags', 'Añade al menos una etiqueta no vacía.'));
  if (!isPositiveInteger(note.position)) issues.push(issue(note.sourcePath, 'position', 'invalid_position', 'Usa un entero mayor que cero.'));
  if (note.topic !== undefined && (!isNonEmptyString(note.topic) || !slugPattern.test(note.topic))) issues.push(issue(note.sourcePath, 'topic', 'invalid_topic', 'Usa un único slug de tema URL-safe.'));
  if (note.format !== 'written' && note.format !== 'video') issues.push(issue(note.sourcePath, 'format', 'invalid_format', 'Usa exactamente written o video.'));
  if (note.format === 'written') {
    if (!isNonEmptyString(note.body)) issues.push(issue(note.sourcePath, 'body', 'written_missing_body', 'Añade contenido Markdown a la nota escrita.'));
    if (isNonEmptyString(note.youtubeVideoId)) issues.push(issue(note.sourcePath, 'youtubeVideoId', 'written_has_video', 'Elimina youtubeVideoId de la nota escrita.'));
  }
  if (note.format === 'video') {
    if (isNonEmptyString(note.body)) issues.push(issue(note.sourcePath, 'body', 'video_has_body', 'Elimina el cuerpo Markdown de la nota de video.'));
    if (!isNonEmptyString(note.youtubeVideoId) || !youtubeIdPattern.test(note.youtubeVideoId)) issues.push(issue(note.sourcePath, 'youtubeVideoId', 'invalid_youtube_id', 'Añade un ID válido de YouTube de 11 caracteres.'));
  }
  return issues;
};

const duplicateIssues = <T>(
  values: ReadonlyArray<T>,
  keyOf: (value: T) => unknown,
  sourceOf: (value: T) => string,
  field: string,
  code: string,
  message: string,
): ContentValidationIssue[] => {
  const seen = new Set<unknown>();
  const issues: ContentValidationIssue[] = [];
  for (const value of values) {
    const key = keyOf(value);
    if (seen.has(key)) issues.push(issue(sourceOf(value), field, code, message));
    seen.add(key);
  }
  return issues;
};

const validateRelations = (categories: ReadonlyArray<CategoryInput>, notes: ReadonlyArray<NoteInput>): ContentValidationIssue[] => {
  const categoryIds = new Set(categories.map(({ id }) => id));
  const notesByCategory = new Map<unknown, NoteInput[]>();
  for (const note of notes) {
    const categoryNotes = notesByCategory.get(note.category) ?? [];
    categoryNotes.push(note);
    notesByCategory.set(note.category, categoryNotes);
  }
  const issues = duplicateIssues(categories, ({ id }) => id, ({ sourcePath }) => sourcePath, 'id', 'duplicate_id', 'El ID de categoría debe ser único.');
  issues.push(...duplicateIssues(notes, ({ category, id }) => `${String(category)}:${String(id)}`, ({ sourcePath }) => sourcePath, 'id', 'duplicate_route', 'La combinación de categoría e ID de nota debe ser única.'));
  for (const note of notes) {
    if (!categoryIds.has(note.category)) issues.push(issue(note.sourcePath, 'category', 'unknown_category', 'Referencia una categoría existente.'));
  }
  for (const category of categories) {
    const topics = Array.isArray(category.topics) ? category.topics as ReadonlyArray<TopicInput> : [];
    const categoryNotes = notesByCategory.get(category.id) ?? [];
    const topicIds = new Set(topics.map(({ id }) => id));
    for (const note of categoryNotes) {
      if (note.topic !== undefined && !topicIds.has(note.topic)) {
        issues.push(issue(note.sourcePath, 'topic', 'unknown_topic', `El tema "${String(note.topic)}" no existe en la categoría "${String(category.id)}" declarada en ${category.sourcePath}.`));
      }
    }

    const positioned = [
      ...topics.map((topic, index) => ({ position: topic.position, sourcePath: category.sourcePath, label: `tema "${String(topic.id)}"`, field: `topics[${index}].position` })),
      ...categoryNotes.map((note) => ({ position: note.position, sourcePath: note.sourcePath, label: `nota "${String(note.id)}"`, field: 'position' })),
    ];
    const firstByPosition = new Map<unknown, (typeof positioned)[number]>();
    for (const value of positioned) {
      const first = firstByPosition.get(value.position);
      if (first) {
        const conflict = `${value.label} (${value.sourcePath}) entra en conflicto con ${first.label} (${first.sourcePath}) en la posición ${String(value.position)}.`;
        issues.push(issue(value.sourcePath, value.field, 'duplicate_position', conflict));
        issues.push(issue(first.sourcePath, first.field, 'duplicate_position', conflict));
      } else {
        firstByPosition.set(value.position, value);
      }
    }
  }
  return issues;
};

const validateSocialLinks = (siteConfig: SiteConfigInput): ContentValidationIssue[] => {
  const sourcePath = 'src/data/site.ts';
  const issues: ContentValidationIssue[] = [];
  for (const link of siteConfig.socialLinks) {
    if (!isNonEmptyString(link.network)) issues.push(issue(sourcePath, 'network', 'empty_network', 'Añade una clave de red no vacía.'));
    if (!isNonEmptyString(link.label)) issues.push(issue(sourcePath, 'label', 'empty_label', 'Añade una etiqueta descriptiva no vacía.'));
    if (!isHttpsUrl(link.url)) issues.push(issue(sourcePath, 'url', 'invalid_social_url', 'Usa una URL HTTPS absoluta.'));
  }
  issues.push(...duplicateIssues(siteConfig.socialLinks, ({ network }) => network, () => sourcePath, 'network', 'duplicate_network', 'Cada red debe ser única.'));
  issues.push(...duplicateIssues(siteConfig.socialLinks, ({ url }) => url, () => sourcePath, 'url', 'duplicate_social_url', 'Cada URL social debe ser única.'));
  return issues;
};

export const validateContent = (
  categories: ReadonlyArray<CategoryInput>,
  notes: ReadonlyArray<NoteInput>,
  siteConfig: SiteConfigInput,
): ContentValidationIssue[] => [
  ...categories.flatMap(validateCategoryInput),
  ...notes.flatMap(validateNoteInput),
  ...validateRelations(categories, notes),
  ...validateSocialLinks(siteConfig),
];
