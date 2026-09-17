import { afterEach, describe, expect, it } from 'vitest';
import matter from 'gray-matter';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { loadContentRepository } from '../../../admin/src/lib/server/content-repository';
import { serializeCategoryDocument, serializeNoteDocument } from '../../../admin/src/lib/server/content-serialization';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

describe('content repository', () => {
  it('loads valid files, revisions, and a derived tag index', async () => {
    repository = await createAdminRepository();
    const snapshot = await loadContentRepository(repository.root);

    expect(snapshot.categories).toHaveLength(1);
    expect(snapshot.notes).toHaveLength(1);
    expect(snapshot.categories[0].revision).toMatch(/^[a-f0-9]{64}$/);
    expect(snapshot.tags).toEqual([{ value: 'dart', usageCount: 1 }]);
    expect(snapshot.snapshotRevision).toMatch(/^[a-f0-9]{64}$/);
  });

  it('reports invalid JSON/frontmatter without hiding valid content', async () => {
    repository = await createAdminRepository({
      'src/content/categories/broken.json': '{not-json',
      'src/content/notes/dart/broken.md': '---\ninvalid: [\n---\n',
    });
    const snapshot = await loadContentRepository(repository.root);

    expect(snapshot.categories).toHaveLength(1);
    expect(snapshot.notes).toHaveLength(1);
    expect(snapshot.issues.map(({ code }) => code)).toEqual(expect.arrayContaining(['invalid_json', 'invalid_frontmatter']));
  });

  it('preserves unmanaged keys while serializing managed fields', async () => {
    repository = await createAdminRepository();
    const originalCategory = await repository.read('src/content/categories/dart.json');
    const originalNote = await repository.read('src/content/notes/dart/intro.md');
    const category = serializeCategoryDocument(originalCategory, { name: 'Dart actualizado' });
    const note = serializeNoteDocument(originalNote, { title: 'Título nuevo', format: 'written' }, '# Cuerpo nuevo\n');

    expect(JSON.parse(category)).toMatchObject({ name: 'Dart actualizado', description: 'Aprende Dart' });
    expect(matter(note).data).toMatchObject({ title: 'Título nuevo', customKey: 'conservar' });
    expect(matter(note).content).toContain('# Cuerpo nuevo');
  });
});
