import { preview } from 'astro';

const server = await preview({
  root: process.cwd(),
  server: { host: '127.0.0.1', port: 4321 },
});

let shuttingDown = false;
const stop = async (): Promise<void> => {
  if (shuttingDown) return;
  shuttingDown = true;
  await server.stop();
};

process.once('SIGINT', () => { void stop(); });
process.once('SIGTERM', () => { void stop(); });
