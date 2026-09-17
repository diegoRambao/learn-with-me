import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';

const repositoryRoot = process.cwd();
const distRoot = resolve(repositoryRoot, 'dist');
const forbiddenPathPattern = /(^|\/)(?:admin|api)(?:\/|$)/i;
const forbiddenContents = [
  '.content-admin',
  'X-Content-Admin-Token',
  'Administrador local',
  '/api/bootstrap',
  'trashId',
] as const;

const listFiles = async (directory: string): Promise<ReadonlyArray<string>> => {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory()
    ? listFiles(join(directory, entry.name))
    : [join(directory, entry.name)]))).flat();
};

const verify = async (): Promise<void> => {
  if (!(await stat(distRoot)).isDirectory()) throw new Error('No existe dist/. Ejecuta npm run build antes de verificar el aislamiento.');
  const files = await listFiles(distRoot);
  const forbiddenPaths = files
    .map((path) => relative(distRoot, path).replaceAll(sep, '/'))
    .filter((path) => forbiddenPathPattern.test(path));
  const leaks: string[] = [];
  for (const path of files.filter((file) => /\.(?:html|js|css|json|map|txt)$/i.test(file))) {
    const contents = await readFile(path, 'utf8');
    for (const marker of forbiddenContents) if (contents.includes(marker)) leaks.push(`${relative(distRoot, path)}: ${marker}`);
  }
  if (forbiddenPaths.length > 0 || leaks.length > 0) {
    throw new Error(`El build público contiene artefactos administrativos:\n${[...forbiddenPaths, ...leaks].map((item) => `- ${item}`).join('\n')}`);
  }
  console.log(`Aislamiento público verificado en ${files.length} archivos: sin rutas, runtime ni identificadores administrativos.`);
};

verify().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
