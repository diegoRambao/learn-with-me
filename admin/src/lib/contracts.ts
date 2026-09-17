export type ValidationIssue = Readonly<{
  sourcePath: string;
  field: string;
  code: string;
  message: string;
}>;

export type CategoryLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export type Topic = Readonly<{
  id: string;
  name: string;
  position: number;
  categoryId: string;
}>;

export type CategoryDocument = Readonly<{
  id: string;
  name: string;
  description: string;
  image: string;
  level: CategoryLevel;
  topics: ReadonlyArray<Topic>;
  sourcePath: string;
  revision: string;
}>;

type NoteDocumentBase = Readonly<{
  id: string;
  folder: string;
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  category: string;
  topic?: string;
  durationMinutes: number;
  position: number;
  sourcePath: string;
  revision: string;
  status: 'active';
}>;

export type WrittenNoteDocument = NoteDocumentBase & Readonly<{
  format: 'written';
  body: string;
  youtubeVideoId?: never;
  managedAssets: ReadonlyArray<string>;
}>;

export type VideoNoteDocument = NoteDocumentBase & Readonly<{
  format: 'video';
  body: '';
  youtubeVideoId: string;
}>;

export type NoteDocument = WrittenNoteDocument | VideoNoteDocument;

export type Tag = Readonly<{ value: string; usageCount: number }>;

export type ContentSnapshot = Readonly<{
  categories: ReadonlyArray<CategoryDocument>;
  notes: ReadonlyArray<NoteDocument>;
  tags: ReadonlyArray<Tag>;
  issues: ReadonlyArray<ValidationIssue>;
  snapshotRevision: string;
}>;

export type ManagedAsset = Readonly<{
  uploadToken: string;
  originalName: string;
  safeFileName: string;
  mediaType: string;
  byteSize: number;
  sha256: string;
  stagedPath: string;
  destinationPath: string;
  markdownReference: string;
  createdAt: string;
}>;

export type TrashSummary = Readonly<{
  trashId: string;
  title: string;
  category: string;
  originalPath: string;
  deletedAt: string;
  manifestRevision: string;
  canRestore: boolean;
}>;

export type EditingDraft<TValues = Readonly<Record<string, unknown>>> = Readonly<{
  kind: 'category' | 'topic' | 'note' | 'order';
  identity?: Readonly<Record<string, string>>;
  baseRevision: string | null;
  values: TValues;
  dirty: boolean;
  fieldIssues: Readonly<Record<string, ReadonlyArray<string>>>;
  pendingUploads: ReadonlyArray<string>;
}>;

export type TopicOrderItem = Readonly<{
  kind: 'topic';
  id: string;
  position: number;
  label: string;
}>;

export type NoteOrderItem = Readonly<{
  kind: 'note';
  id: string;
  folder: string;
  topic: string | null;
  position: number;
  label: string;
}>;

export type OrderItem = TopicOrderItem | NoteOrderItem;

export type OrderDraft = Readonly<{
  categoryId: string;
  items: ReadonlyArray<OrderItem>;
  baseRevisions: Readonly<Record<string, string>>;
}>;

export type ApiSuccess<T> = Readonly<{
  data: T;
  message?: string;
  changedPaths?: ReadonlyArray<string>;
}>;

export type ApiErrorBody = Readonly<{
  error: Readonly<{
    code: string;
    message: string;
    issues?: ReadonlyArray<ValidationIssue>;
    incidentId?: string;
    details?: ReadonlyArray<string>;
  }>;
}>;

export type BootstrapData = Readonly<{
  snapshot: ContentSnapshot;
  trash: ReadonlyArray<TrashSummary>;
  capabilities: Readonly<{
    createCategories: true;
    createTopics: true;
    createNotes: true;
    uploads: true;
    trash: true;
  }>;
  csrfToken: string;
}>;

export type NoteMutationInput = Readonly<{
  id: string;
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  category: string;
  topic?: string;
  durationMinutes: number;
  position: number;
  format: 'written' | 'video';
  body: string;
  youtubeVideoId?: string;
  uploadTokens?: ReadonlyArray<string>;
}>;

export type CategoryMutationInput = Readonly<{
  id: string;
  name: string;
  description: string;
  image: string;
  level: CategoryLevel;
  topics?: ReadonlyArray<Readonly<{ id: string; name: string; position: number }>>;
}>;

export type TopicMutationInput = Readonly<{
  id: string;
  name: string;
  position: number;
}>;
