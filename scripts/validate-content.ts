import { readFile, readdir } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import matter from 'gray-matter';
import { siteConfig } from '../src/data/site';
import { validateContent, type CategoryInput, type NoteInput } from '../src/lib/validation';

const root = process.cwd();

const loadCategories = async (): Promise<ReadonlyArray<CategoryInput>> => {
  const directory = join(root, 'src/content/categories');
  const fileNames = (await readdir(directory)).filter((fileName) => fileName.endsWith('.json'));
  return Promise.all(fileNames.map(async (fileName) => {
    const sourcePath = relative(root, join(directory, fileName));
    const data = JSON.parse(await readFile(join(directory, fileName), 'utf8')) as Record<string, unknown>;
    return { sourcePath, id: basename(fileName, '.json'), name: data.name, description: data.description, image: data.image, level: data.level };
  }));
};

const loadNotes = async (): Promise<ReadonlyArray<NoteInput>> => {
  const directory = join(root, 'src/content/notes');
  const fileNames = (await readdir(directory)).filter((fileName) => fileName.endsWith('.md'));
  return Promise.all(fileNames.map(async (fileName) => {
    const sourcePath = relative(root, join(directory, fileName));
    const parsed = matter(await readFile(join(directory, fileName), 'utf8'));
    return { sourcePath, id: basename(fileName, '.md'), ...parsed.data, body: parsed.content } as NoteInput;
  }));
};

const printIssues = (issues: ReturnType<typeof validateContent>): void => {
  const grouped = new Map<string, typeof issues>();
  for (const validationIssue of issues) {
    const sourceIssues = grouped.get(validationIssue.sourcePath) ?? [];
    grouped.set(validationIssue.sourcePath, [...sourceIssues, validationIssue]);
  }
  for (const [sourcePath, sourceIssues] of grouped) {
    console.error(`\n${sourcePath}`);
    for (const { field, code, message } of sourceIssues) console.error(`  ${field} [${code}]: ${message}`);
  }
};

try {
  const issues = validateContent(await loadCategories(), await loadNotes(), siteConfig);
  if (issues.length > 0) {
    console.error(`La validación encontró ${issues.length} problema(s):`);
    printIssues(issues);
    process.exitCode = 1;
  } else {
    console.log('Contenido y configuración válidos.');
  }
} catch (error) {
  console.error('No se pudo validar el contenido. Revisa que los archivos tengan JSON, frontmatter y rutas válidas.');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
