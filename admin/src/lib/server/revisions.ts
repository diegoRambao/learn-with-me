import { createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export const sha256 = (value: string | Uint8Array): string =>
  createHash('sha256').update(value).digest('hex');

export const verifyRevision = (value: string | Uint8Array, expectedRevision: string): boolean => {
  const actual = Buffer.from(sha256(value), 'hex');
  const expected = Buffer.from(expectedRevision, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

export const revisionForFile = async (path: string): Promise<string> => sha256(await readFile(path));
