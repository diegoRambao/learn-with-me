import { dev } from 'astro';
import { join } from 'node:path';

const repositoryRoot = process.cwd();
process.env.CONTENT_ADMIN_REPOSITORY_ROOT = '.content-admin/e2e-repository';

const server = await dev({
  root: join(repositoryRoot, 'admin'),
  server: { host: '127.0.0.1', port: 4322 },
});

let shuttingDown = false;
const stop = async (): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  await server.stop();
};

process.once('SIGINT', () => { void stop(); });
process.once('SIGTERM', () => { void stop(); });
