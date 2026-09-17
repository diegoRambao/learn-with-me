import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { noteEntryIdFromPath } from './lib/note-path';

const nonEmptyText = z.string().trim().min(1);
const positiveInteger = z.number().int().positive();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const topicSchema = z.object({
  id: slug,
  name: nonEmptyText,
  position: positiveInteger,
});
const imageReference = z.string().refine((value) => {
  if (value.startsWith('/images/categories/')) return value.length > '/images/categories/'.length;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}, 'La imagen debe estar bajo /images/categories/ o ser una URL HTTPS');

const categories = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/categories' }),
  schema: z.object({
    name: nonEmptyText,
    description: nonEmptyText,
    image: imageReference,
    level: z.enum(['beginner', 'intermediate', 'advanced', 'pro']),
    topics: z.array(topicSchema),
  }),
});

const notes = defineCollection({
  loader: glob({
    pattern: '*/*.md',
    base: './src/content/notes',
    generateId: ({ entry }) => noteEntryIdFromPath(entry),
  }),
  schema: z.discriminatedUnion('format', [
    z.object({
      title: nonEmptyText,
      description: nonEmptyText,
      tags: z.array(nonEmptyText).min(1),
      category: nonEmptyText,
      durationMinutes: positiveInteger,
      position: positiveInteger,
      format: z.literal('written'),
      topic: slug.optional(),
      youtubeVideoId: z.never().optional(),
    }),
    z.object({
      title: nonEmptyText,
      description: nonEmptyText,
      tags: z.array(nonEmptyText).min(1),
      category: nonEmptyText,
      durationMinutes: positiveInteger,
      position: positiveInteger,
      format: z.literal('video'),
      topic: slug.optional(),
      youtubeVideoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/),
    }),
  ]),
});

export const collections = { categories, notes };
