import { fileURLToPath } from 'node:url';
import { isAbsolute, resolve } from 'node:path';

const defaultRepositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const configuredRoot = process.env.CONTENT_ADMIN_REPOSITORY_ROOT;

export const repositoryRoot = configuredRoot
  ? resolve(isAbsolute(configuredRoot) ? configuredRoot : resolve(defaultRepositoryRoot, configuredRoot))
  : defaultRepositoryRoot;
