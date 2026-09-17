import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import type { ApiErrorBody, ApiSuccess, ValidationIssue } from '../contracts';

const csrfToken = randomBytes(32).toString('base64url');
const localHostPattern = /^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/i;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly issues?: ReadonlyArray<ValidationIssue>,
    readonly details?: ReadonlyArray<string>,
  ) {
    super(message);
  }
}

export const getProcessCsrfToken = (): string => csrfToken;

const equalToken = (candidate: string): boolean => {
  const expected = Buffer.from(csrfToken);
  const actual = Buffer.from(candidate);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const assertLocalRequest = (request: Request, options: Readonly<{ requireToken?: boolean }> = {}): void => {
  const host = request.headers.get('host') ?? new URL(request.url).host;
  if (!localHostPattern.test(host)) throw new HttpError(403, 'local_boundary', 'Esta herramienta solo acepta solicitudes desde el equipo local.');
  const origin = request.headers.get('origin');
  if (origin) {
    let parsed: URL;
    try {
      parsed = new URL(origin);
    } catch {
      throw new HttpError(403, 'local_boundary', 'El origen de la solicitud no está permitido.');
    }
    if (parsed.protocol !== 'http:' || !localHostPattern.test(parsed.host)) {
      throw new HttpError(403, 'local_boundary', 'El origen de la solicitud no está permitido.');
    }
  }
  if (options.requireToken && !equalToken(request.headers.get('x-content-admin-token') ?? '')) {
    throw new HttpError(401, 'invalid_token', 'La sesión local dejó de ser válida. Recarga el administrador.');
  }
};

export const assertContentType = (request: Request, expected: 'json' | 'multipart'): void => {
  const contentType = request.headers.get('content-type') ?? '';
  const valid = expected === 'json'
    ? contentType.toLowerCase().startsWith('application/json')
    : contentType.toLowerCase().startsWith('multipart/form-data');
  if (!valid) throw new HttpError(415, 'unsupported_media_type', expected === 'json' ? 'Envía datos JSON válidos.' : 'Envía una imagen mediante multipart/form-data.');
};

export const readJson = async <T>(request: Request, maximumBytes = 1_000_000): Promise<T> => {
  assertContentType(request, 'json');
  const body = await request.text();
  if (Buffer.byteLength(body) > maximumBytes) throw new HttpError(413, 'payload_too_large', 'El contenido supera el tamaño permitido.');
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new HttpError(400, 'invalid_json', 'Revisa el formato JSON de la solicitud.');
  }
};

export const jsonSuccess = <T>(data: T, init: ResponseInit & Readonly<{ message?: string; changedPaths?: ReadonlyArray<string> }> = {}): Response => {
  const { message, changedPaths, ...responseInit } = init;
  const body: ApiSuccess<T> = { data, ...(message ? { message } : {}), ...(changedPaths ? { changedPaths } : {}) };
  return Response.json(body, responseInit);
};

export const errorResponse = (error: unknown): Response => {
  if (error instanceof HttpError) {
    const body: ApiErrorBody = { error: { code: error.code, message: error.message, ...(error.issues ? { issues: error.issues } : {}), ...(error.details ? { details: error.details } : {}) } };
    return Response.json(body, { status: error.status });
  }
  const incidentId = randomUUID();
  console.error(`[content-admin:${incidentId}]`, error);
  const body: ApiErrorBody = { error: { code: 'internal_error', message: 'No se pudo completar la operación. La versión anterior sigue disponible.', incidentId } };
  return Response.json(body, { status: 500 });
};

export const noStoreHeaders = Object.freeze({
  'cache-control': 'no-store',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'no-referrer',
});
