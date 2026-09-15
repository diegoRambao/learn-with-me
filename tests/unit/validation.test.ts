import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import matter from 'gray-matter';
import { validateContent, type NoteInput } from '../../src/lib/validation';

const validCategory = { sourcePath: 'categories/flutter.json', id: 'flutter', name: 'Flutter', description: 'Widgets para aplicaciones', image: '/images/categories/flutter.svg', level: 'beginner' };
const validWritten = { sourcePath: 'notes/intro.md', id: 'intro', title: 'Intro', description: 'Introducción', tags: ['flutter'], category: 'flutter', durationMinutes: 5, position: 1, format: 'written', body: '# Hola' };

describe('validateContent', () => {
  it('accepts a complete content graph', () => {
    expect(validateContent([validCategory], [validWritten], { socialLinks: [] })).toEqual([]);
  });

  it('accumulates duplicate ids, missing categories and duplicate positions', () => {
    const issues = validateContent(
      [validCategory, { ...validCategory, sourcePath: 'categories/copy.json' }],
      [
        validWritten,
        { ...validWritten, sourcePath: 'notes/other.md', id: 'other' },
        { ...validWritten, sourcePath: 'notes/missing.md', id: 'missing', category: 'missing', position: 2 },
      ],
      { socialLinks: [] },
    );
    expect(issues.map(({ code }) => code)).toEqual(expect.arrayContaining(['duplicate_id', 'unknown_category', 'duplicate_position']));
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
