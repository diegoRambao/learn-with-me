const normalizeSeparators = (value: string): string => value.replaceAll('\\', '/');

export const noteEntryIdFromPath = (entryPath: string): string =>
  normalizeSeparators(entryPath).replace(/\.md$/u, '');

export const noteIdFromEntryId = (entryId: string): string =>
  normalizeSeparators(entryId).split('/').at(-1) ?? entryId;
