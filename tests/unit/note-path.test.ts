import { describe, expect, it } from 'vitest';
import { noteEntryIdFromPath, noteIdFromEntryId } from '../../src/lib/note-path';

describe('note paths', () => {
  it('keeps the folder in the internal entry id', () => {
    expect(noteEntryIdFromPath('dart/types.md')).toBe('dart/types');
    expect(noteEntryIdFromPath('dart\\types.md')).toBe('dart/types');
  });

  it('derives the public id only from the file name', () => {
    expect(noteIdFromEntryId('dart/intro')).toBe('intro');
    expect(noteIdFromEntryId('flutter-basic/intro')).toBe('intro');
  });
});
