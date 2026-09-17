import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join, relative, sep } from 'node:path';
import matter from 'gray-matter';
import { siteConfig } from '../../../../src/data/site';
import { validateContent, type CategoryInput, type NoteInput } from '../../../../src/lib/validation';
import type { CategoryDocument, ContentSnapshot, NoteDocument, Tag, ValidationIssue } from '../contracts';
import { sha256 } from './revisions';
import { createRepositoryPaths } from './safe-paths';

const portable = (value: string): string => value.replaceAll(sep, '/');

const listFiles = async (directory: string, extension: string): Promise<ReadonlyArray<string>> => {
  try {
    return (await readdir(directory, { recursive: true }))
      .filter((entry): entry is string => typeof entry === 'string' && extname(entry) === extension)
      .sort();
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw error;
  }
};

const parseCategory = async (repositoryRoot: string, categoriesRoot: string, fileName: string) => {
  const absolutePath = join(categoriesRoot, fileName);
  const sourcePath = portable(relative(repositoryRoot, absolutePath));
  const bytes = await readFile(absolutePath);
  try {
    const data = JSON.parse(bytes.toString('utf8')) as Record<string, unknown>;
    const id = basename(fileName, '.json');
    const input: CategoryInput = { sourcePath, id, name: data.name, description: data.description, image: data.image, level: data.level, topics: data.topics };
    const topics = Array.isArray(data.topics) ? data.topics.map((raw) => {
      const topic = raw as Record<string, unknown>;
      return { id: String(topic.id ?? ''), name: String(topic.name ?? ''), position: Number(topic.position), categoryId: id };
    }) : [];
    const document: CategoryDocument = {
      id,
      name: String(data.name ?? ''),
      description: String(data.description ?? ''),
      image: String(data.image ?? ''),
      level: data.level as CategoryDocument['level'],
      topics,
      sourcePath,
      revision: sha256(bytes),
    };
    return { input, document, issue: null };
  } catch {
    return {
      input: null,
      document: null,
      issue: { sourcePath, field: 'document', code: 'invalid_json', message: 'Corrige el JSON antes de editar este archivo.' } satisfies ValidationIssue,
    };
  }
};

const managedAssetsFromBody = (body: string): ReadonlyArray<string> =>
  [...body.matchAll(/!\[[^\]]*\]\((assets\/[a-zA-Z0-9._-]+)(?:\s+"[^"]*")?\)/g)].map((match) => match[1]);

const parseNote = async (repositoryRoot: string, notesRoot: string, fileName: string) => {
  const absolutePath = join(notesRoot, fileName);
  const sourcePath = portable(relative(repositoryRoot, absolutePath));
  const bytes = await readFile(absolutePath);
  const pathSegments = portable(fileName).replace(/\.md$/u, '').split('/');
  try {
    const parsed = matter(bytes.toString('utf8'));
    const data = parsed.data as Record<string, unknown>;
    const folder = pathSegments[0] ?? '';
    const id = pathSegments.at(-1) ?? '';
    const input: NoteInput = {
      sourcePath,
      folder,
      depth: pathSegments.length,
      id,
      title: data.title,
      description: data.description,
      tags: data.tags,
      category: data.category,
      topic: data.topic,
      durationMinutes: data.durationMinutes,
      position: data.position,
      format: data.format,
      youtubeVideoId: data.youtubeVideoId,
      body: parsed.content,
    };
    const common = {
      id,
      folder,
      title: String(data.title ?? ''),
      description: String(data.description ?? ''),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      category: String(data.category ?? ''),
      ...(data.topic === undefined ? {} : { topic: String(data.topic) }),
      durationMinutes: Number(data.durationMinutes),
      position: Number(data.position),
      sourcePath,
      revision: sha256(bytes),
      status: 'active' as const,
    };
    const document: NoteDocument = data.format === 'video'
      ? { ...common, format: 'video', body: '', youtubeVideoId: String(data.youtubeVideoId ?? '') }
      : { ...common, format: 'written', body: parsed.content, managedAssets: managedAssetsFromBody(parsed.content) };
    return { input, document, issue: null };
  } catch {
    return {
      input: null,
      document: null,
      issue: { sourcePath, field: 'frontmatter', code: 'invalid_frontmatter', message: 'Corrige el frontmatter antes de editar este archivo.' } satisfies ValidationIssue,
    };
  }
};

const createTagIndex = (notes: ReadonlyArray<NoteDocument>): ReadonlyArray<Tag> => {
  const tags = new Map<string, { value: string; usageCount: number }>();
  for (const note of notes) {
    for (const value of note.tags) {
      const key = value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('es');
      const current = tags.get(key);
      tags.set(key, current ? { ...current, usageCount: current.usageCount + 1 } : { value: value.trim(), usageCount: 1 });
    }
  }
  return [...tags.values()].sort((left, right) => left.value.localeCompare(right.value, 'es', { sensitivity: 'base' }));
};

export const loadContentRepository = async (repositoryRoot: string): Promise<ContentSnapshot> => {
  const paths = createRepositoryPaths(repositoryRoot);
  const [categoryResults, noteResults] = await Promise.all([
    Promise.all((await listFiles(paths.categoriesRoot, '.json')).map((fileName) => parseCategory(paths.repositoryRoot, paths.categoriesRoot, fileName))),
    Promise.all((await listFiles(paths.notesRoot, '.md')).map((fileName) => parseNote(paths.repositoryRoot, paths.notesRoot, fileName))),
  ]);
  const categories = categoryResults.flatMap(({ document }) => document ? [document] : []);
  const notes = noteResults.flatMap(({ document }) => document ? [document] : []);
  const parseIssues = [...categoryResults, ...noteResults].flatMap(({ issue }) => issue ? [issue] : []);
  const categoryInputs = categoryResults.flatMap(({ input }) => input ? [input] : []);
  const noteInputs = noteResults.flatMap(({ input }) => input ? [input] : []);
  const validationIssues = validateContent(categoryInputs, noteInputs, siteConfig);
  const revisions = [...categories, ...notes]
    .map(({ sourcePath, revision }) => `${sourcePath}:${revision}`)
    .sort()
    .join('\n');
  return {
    categories,
    notes,
    tags: createTagIndex(notes),
    issues: [...parseIssues, ...validationIssues],
    snapshotRevision: sha256(revisions),
  };
};
