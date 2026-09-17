import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { validateContent, type NoteInput } from '../../src/lib/validation';

const validCategory = { sourcePath: 'categories/flutter.json', id: 'flutter', name: 'Flutter', description: 'Widgets para aplicaciones', image: '/images/categories/flutter.svg', level: 'beginner', topics: [] };
const validWritten = { sourcePath: 'notes/guides/intro.md', folder: 'guides', depth: 2, id: 'intro', title: 'Intro', description: 'Introducción', tags: ['flutter'], category: 'flutter', durationMinutes: 5, position: 1, format: 'written', body: '# Hola' };

describe('validateContent', () => {
  it('accepts a complete content graph', () => {
    expect(validateContent([validCategory], [validWritten], { socialLinks: [] })).toEqual([]);
  });

  it('accumulates duplicate ids, missing categories and duplicate positions', () => {
    const issues = validateContent(
      [validCategory, { ...validCategory, sourcePath: 'categories/copy.json' }],
      [
        validWritten,
        { ...validWritten, sourcePath: 'notes/guides/copy.md' },
        { ...validWritten, sourcePath: 'notes/guides/missing.md', id: 'missing', category: 'missing' },
      ],
      { socialLinks: [] },
    );
    expect(issues.map(({ code }) => code)).toEqual(expect.arrayContaining(['duplicate_id', 'duplicate_route', 'unknown_category', 'duplicate_position']));
  });

  it('allows the same note id in different categories', () => {
    const dartCategory = { ...validCategory, sourcePath: 'categories/dart.json', id: 'dart', name: 'Dart' };
    const notes = [
      validWritten,
      { ...validWritten, sourcePath: 'notes/dart/intro.md', folder: 'dart', category: 'dart' },
    ];

    expect(validateContent([validCategory, dartCategory], notes, { socialLinks: [] })).toEqual([]);
  });

  it('validates topic fields, duplicate ids, references, and shared positions', () => {
    const category = {
      ...validCategory,
      topics: [
        { id: 'fundamentos', name: 'Fundamentos', position: 1 },
        { id: 'fundamentos', name: ' ', position: 2 },
        { id: 'No válido', name: 'Avanzado', position: 0 },
      ],
    };
    const issues = validateContent([category], [
      { ...validWritten, topic: 'ausente', position: 1 },
      { ...validWritten, id: 'second', sourcePath: 'notes/guides/second.md', position: 2 },
    ], { socialLinks: [] });

    expect(issues.map(({ code }) => code)).toEqual(expect.arrayContaining([
      'duplicate_topic_id',
      'empty_topic_name',
      'invalid_topic_id',
      'invalid_topic_position',
      'unknown_topic',
      'duplicate_position',
    ]));
    expect(issues.find(({ code }) => code === 'duplicate_position')?.message).toContain('categories/flutter.json');
  });

  it('does not resolve a topic declared by another category', () => {
    const dartCategory = { ...validCategory, sourcePath: 'categories/dart.json', id: 'dart', topics: [{ id: 'language', name: 'Lenguaje', position: 1 }] };
    const issues = validateContent([validCategory, dartCategory], [{ ...validWritten, topic: 'language' }], { socialLinks: [] });

    expect(issues.map(({ code }) => code)).toContain('unknown_topic');
  });

  it('requires exactly one slug folder for every note', () => {
    const notes = [
      { ...validWritten, sourcePath: 'notes/loose.md', folder: undefined, depth: 1 },
      { ...validWritten, sourcePath: 'notes/deep/topic/intro.md', folder: 'deep', depth: 3, id: 'deep-intro', position: 2 },
      { ...validWritten, sourcePath: 'notes/Not Valid/other.md', folder: 'Not Valid', id: 'other', position: 3 },
    ];
    const issues = validateContent([validCategory], notes, { socialLinks: [] });

    expect(issues.filter(({ code }) => code === 'invalid_location')).toHaveLength(2);
    expect(issues.map(({ code }) => code)).toContain('invalid_folder');
  });

  it('rejects non-positive or fractional numeric fields', () => {
    const issues = validateContent([validCategory], [{ ...validWritten, durationMinutes: 0, position: 1.5 }], { socialLinks: [] });
    expect(issues.map(({ field }) => field)).toEqual(expect.arrayContaining(['durationMinutes', 'position']));
  });

  it('requires a category description and non-empty note tags', () => {
    const issues = validateContent(
      [{ ...validCategory, description: ' ' }],
      [{ ...validWritten, tags: [] }, { ...validWritten, id: 'empty-tag', position: 2, tags: [' '] }],
      { socialLinks: [] },
    );
    expect(issues.map(({ field }) => field)).toEqual(expect.arrayContaining(['description', 'tags']));
  });

  it('enforces mutually exclusive written and video payloads', () => {
    const issues = validateContent([validCategory], [
      { ...validWritten, youtubeVideoId: 'M7lc1UVf-VE' },
      { ...validWritten, id: 'video', position: 2, format: 'video', body: 'not empty', youtubeVideoId: 'bad url' },
    ], { socialLinks: [] });
    expect(issues.map(({ code }) => code)).toEqual(expect.arrayContaining(['written_has_video', 'video_has_body', 'invalid_youtube_id']));
  });

  it('rejects invalid and duplicate social links', () => {
    const issues = validateContent([validCategory], [validWritten], { socialLinks: [
      { network: 'web', label: '', url: 'http://example.com' },
      { network: 'web', label: 'Duplicada', url: 'http://example.com' },
    ] });
    expect(issues.map(({ code }) => code)).toEqual(expect.arrayContaining(['empty_label', 'invalid_social_url', 'duplicate_network', 'duplicate_social_url']));
  });

  it('accumulates actionable issues from the versioned invalid fixtures', () => {
    const category = JSON.parse(readFileSync(new URL('../fixtures/invalid-content/categories/invalid-category.json', import.meta.url), 'utf8'));
    const invalidWritten = matter(readFileSync(new URL('../fixtures/invalid-content/notes/invalid-notes.md', import.meta.url), 'utf8'));
    const invalidVideo = matter(readFileSync(new URL('../fixtures/invalid-content/notes/invalid-video.md', import.meta.url), 'utf8'));
    const missingFields = matter(readFileSync(new URL('../fixtures/invalid-content/notes/missing-fields.md', import.meta.url), 'utf8'));
    const site = JSON.parse(readFileSync(new URL('../fixtures/invalid-content/site/invalid-social-links.json', import.meta.url), 'utf8'));
    const notes: NoteInput[] = [invalidWritten, invalidVideo, missingFields].map((fixture, index) => ({
      sourcePath: `fixture-${index}.md`,
      folder: 'fixtures',
      depth: 2,
      id: `fixture-${index}`,
      title: fixture.data.title,
      description: fixture.data.description,
      tags: fixture.data.tags,
      category: fixture.data.category,
      durationMinutes: fixture.data.durationMinutes,
      position: fixture.data.position,
      format: fixture.data.format,
      youtubeVideoId: fixture.data.youtubeVideoId,
      body: fixture.content,
    }));
    const issues = validateContent([{ sourcePath: 'invalid-category.json', ...category }], notes, site);
    expect(issues.length).toBeGreaterThanOrEqual(12);
    expect([...new Set(issues.map(({ sourcePath }) => sourcePath))]).toEqual(expect.arrayContaining(['invalid-category.json', 'fixture-0.md', 'fixture-1.md', 'fixture-2.md', 'src/data/site.ts']));
  });
});
