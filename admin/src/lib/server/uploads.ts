import { randomUUID } from 'node:crypto';
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ManagedAsset } from '../contracts';
import { HttpError } from './http-guard';
import { sha256 } from './revisions';
import { createRepositoryPaths, normalizeAssetFileName } from './safe-paths';

export const maximumUploadBytes = 10 * 1024 * 1024;
export const uploadTtlMilliseconds = 6 * 60 * 60 * 1000;

type DetectedImage = Readonly<{ mediaType: string; extension: string }>;

const startsWith = (bytes: Uint8Array, signature: ReadonlyArray<number>): boolean =>
  signature.every((value, index) => bytes[index] === value);

const detectImage = (bytes: Uint8Array): DetectedImage | null => {
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mediaType: 'image/png', extension: '.png' };
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return { mediaType: 'image/jpeg', extension: '.jpg' };
  const ascii = Buffer.from(bytes.subarray(0, Math.min(bytes.length, 256))).toString('utf8');
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) return { mediaType: 'image/gif', extension: '.gif' };
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return { mediaType: 'image/webp', extension: '.webp' };
  const text = Buffer.from(bytes).toString('utf8').trimStart();
  if (/^(?:<\?xml[^>]*>\s*)?<svg\b/i.test(text) && !/<script\b|\son[a-z]+\s*=|<!ENTITY/i.test(text)) return { mediaType: 'image/svg+xml', extension: '.svg' };
  return null;
};

const compatibleName = (fileName: string, detected: DetectedImage): boolean => {
  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  return detected.mediaType === 'image/jpeg' ? ['.jpg', '.jpeg'].includes(extension) : extension === detected.extension;
};

export const cleanupExpiredUploads = async (repositoryRoot: string, now = Date.now()): Promise<void> => {
  const { uploadsRoot } = createRepositoryPaths(repositoryRoot);
  let tokens: ReadonlyArray<string> = [];
  try {
    tokens = await readdir(uploadsRoot);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
    throw error;
  }
  await Promise.all(tokens.map(async (token) => {
    const directory = join(uploadsRoot, token);
    try {
      if (now - (await stat(directory)).mtimeMs > uploadTtlMilliseconds) await rm(directory, { recursive: true, force: true });
    } catch {
      // A concurrent successful save may already have consumed this token.
    }
  }));
};

export const stageImageUpload = async (repositoryRoot: string, input: Readonly<{
  bytes: Uint8Array;
  originalName: string;
  declaredType: string;
}>): Promise<ManagedAsset> => {
  if (input.bytes.byteLength === 0) throw new HttpError(415, 'unsupported_image', 'Selecciona una imagen PNG, JPEG, WebP, GIF o SVG válida.');
  if (input.bytes.byteLength > maximumUploadBytes) throw new HttpError(413, 'image_too_large', 'La imagen no puede superar 10 MiB.');
  const detected = detectImage(input.bytes);
  let safeFileName: string;
  try {
    safeFileName = normalizeAssetFileName(input.originalName);
  } catch {
    throw new HttpError(415, 'unsupported_image', 'La extensión, el tipo y los bytes de la imagen deben coincidir con un formato admitido.');
  }
  if (!detected || detected.mediaType !== input.declaredType || !compatibleName(safeFileName, detected)) {
    throw new HttpError(415, 'unsupported_image', 'La extensión, el tipo y los bytes de la imagen deben coincidir con un formato admitido.');
  }
  await cleanupExpiredUploads(repositoryRoot);
  const uploadToken = randomUUID();
  const { uploadsRoot } = createRepositoryPaths(repositoryRoot);
  const directory = join(uploadsRoot, uploadToken);
  await mkdir(directory, { recursive: true });
  const asset: ManagedAsset = {
    uploadToken,
    originalName: input.originalName,
    safeFileName,
    mediaType: detected.mediaType,
    byteSize: input.bytes.byteLength,
    sha256: sha256(input.bytes),
    stagedPath: `.content-admin/uploads/${uploadToken}/blob`,
    destinationPath: '',
    markdownReference: `assets/${safeFileName}`,
    createdAt: new Date().toISOString(),
  };
  await writeFile(join(directory, 'blob'), input.bytes);
  await writeFile(join(directory, 'metadata.json'), `${JSON.stringify(asset, null, 2)}\n`);
  return asset;
};

export const loadStagedUpload = async (repositoryRoot: string, token: string): Promise<Readonly<{ asset: ManagedAsset; bytes: Uint8Array }>> => {
  if (!/^[a-f0-9-]{36}$/i.test(token)) throw new HttpError(404, 'upload_not_found', 'La imagen staged ya no está disponible.');
  const directory = join(createRepositoryPaths(repositoryRoot).uploadsRoot, token);
  try {
    const [metadata, bytes] = await Promise.all([
      readFile(join(directory, 'metadata.json'), 'utf8'),
      readFile(join(directory, 'blob')),
    ]);
    const asset = JSON.parse(metadata) as ManagedAsset;
    if (asset.uploadToken !== token || sha256(bytes) !== asset.sha256) throw new Error('hash mismatch');
    return { asset, bytes };
  } catch {
    throw new HttpError(404, 'upload_not_found', 'La imagen staged ya no está disponible.');
  }
};
