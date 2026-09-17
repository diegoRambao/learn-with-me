import { afterEach, describe, expect, it } from 'vitest';
import { createAdminRepository, type AdminRepositoryFixture } from '../../helpers/admin-repository';
import { handleCategoriesRequest } from '../../../admin/src/pages/api/categories/index';
import { handleCategoryRequest } from '../../../admin/src/pages/api/categories/[categoryId]/index';
import { handleTopicsRequest } from '../../../admin/src/pages/api/categories/[categoryId]/topics/index';
import { handleTopicRequest } from '../../../admin/src/pages/api/categories/[categoryId]/topics/[topicId]';
import { handleOrderRequest } from '../../../admin/src/pages/api/categories/[categoryId]/order';
import { loadContentRepository } from '../../../admin/src/lib/server/content-repository';
import { getProcessCsrfToken } from '../../../admin/src/lib/server/http-guard';

let repository: AdminRepositoryFixture | undefined;
afterEach(async () => repository?.cleanup());

const request = (url: string, method: string, body: unknown): Request => new Request(`http://127.0.0.1:4322${url}`, {
  method,
  headers: { host: '127.0.0.1:4322', origin: 'http://127.0.0.1:4322', 'content-type': 'application/json', 'x-content-admin-token': getProcessCsrfToken() },
  body: JSON.stringify(body),
});

describe('category and topic API contracts', () => {
  it('creates and edits a category while keeping its ID and revision contract', async () => {
    repository = await createAdminRepository();
    const created = await handleCategoriesRequest(request('/api/categories', 'POST', {
      id: 'astro', name: 'Astro', description: 'Web', image: '/images/categories/astro.svg', level: 'intermediate',
    }), repository.root);
    expect(created.status).toBe(201);
    const category = (await created.json()).data;
    const updated = await handleCategoryRequest(request('/api/categories/astro', 'PUT', {
      revision: category.revision, name: 'Astro moderno', description: 'Web actual', image: '/images/categories/astro.svg', level: 'advanced',
    }), repository.root, 'astro');
    expect(updated.status).toBe(200);
    expect((await updated.json()).data).toMatchObject({ id: 'astro', name: 'Astro moderno', topics: [] });
  });

  it('creates and edits a topic without changing its stable ID', async () => {
    repository = await createAdminRepository();
    const snapshot = await loadContentRepository(repository.root);
    const category = snapshot.categories[0];
    const created = await handleTopicsRequest(request('/api/categories/dart/topics', 'POST', {
      categoryRevision: category.revision, id: 'avanzado', name: 'Avanzado', position: 3,
    }), repository.root, 'dart');
    expect(created.status).toBe(201);
    const revision = (await created.json()).data.revision;
    const updated = await handleTopicRequest(request('/api/categories/dart/topics/avanzado', 'PUT', {
      categoryRevision: revision, name: 'Avanzado y async',
    }), repository.root, 'dart', 'avanzado');
    expect(updated.status).toBe(200);
    expect((await updated.json()).data.topics).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'avanzado', name: 'Avanzado y async' })]));
  });

  it('blocks deleting referenced topics and categories with actionable dependencies', async () => {
    repository = await createAdminRepository();
    const category = (await loadContentRepository(repository.root)).categories[0];
    const topicDelete = await handleTopicRequest(request('/api/categories/dart/topics/fundamentos', 'DELETE', { categoryRevision: category.revision }), repository.root, 'dart', 'fundamentos');
    expect(topicDelete.status).toBe(409);
    expect((await topicDelete.json()).error.code).toBe('topic_has_notes');
    const categoryDelete = await handleCategoryRequest(request('/api/categories/dart', 'DELETE', { revision: category.revision, confirmCategoryId: 'dart' }), repository.root, 'dart');
    expect(categoryDelete.status).toBe(409);
    expect((await categoryDelete.json()).error.code).toBe('category_has_notes');
  });

  it('rejects stale revisions without changing the document', async () => {
    repository = await createAdminRepository();
    const response = await handleCategoryRequest(request('/api/categories/dart', 'PUT', {
      revision: 'stale', name: 'No guardar', description: 'x', image: '/images/categories/x.svg', level: 'beginner',
    }), repository.root, 'dart');
    expect(response.status).toBe(409);
    expect(JSON.parse(await repository.read('src/content/categories/dart.json')).name).toBe('Dart');
  });

  it('commits the shared topic/note sequence across every affected file', async () => {
    repository = await createAdminRepository();
    const snapshot = await loadContentRepository(repository.root);
    const category = snapshot.categories[0];
    const note = snapshot.notes[0];
    const response = await handleOrderRequest(request('/api/categories/dart/order', 'POST', {
      items: [
        { kind: 'note', id: note.id, folder: note.folder, topic: null },
        { kind: 'topic', id: category.topics[0].id },
      ],
      baseRevisions: { [category.sourcePath]: category.revision, [note.sourcePath]: note.revision },
    }), repository.root, 'dart');
    expect(response.status).toBe(200);
    const reloaded = await loadContentRepository(repository.root);
    expect(reloaded.notes[0].position).toBe(1);
    expect(reloaded.categories[0].topics[0].position).toBe(2);
    expect(JSON.parse(await repository.read(category.sourcePath)).topics).toEqual([
      { id: 'fundamentos', name: 'Fundamentos', position: 2 },
    ]);
    expect((await response.json()).changedPaths).toEqual(expect.arrayContaining([category.sourcePath, note.sourcePath]));
    expect(reloaded.notes[0].topic).toBeUndefined();
  });

  it('rejects an unknown target topic without changing any file', async () => {
    repository = await createAdminRepository();
    const snapshot = await loadContentRepository(repository.root);
    const category = snapshot.categories[0];
    const note = snapshot.notes[0];
    const beforeCategory = await repository.read(category.sourcePath);
    const beforeNote = await repository.read(note.sourcePath);
    const response = await handleOrderRequest(request('/api/categories/dart/order', 'POST', {
      items: [
        { kind: 'topic', id: category.topics[0].id },
        { kind: 'note', id: note.id, folder: note.folder, topic: 'missing' },
      ],
      baseRevisions: { [category.sourcePath]: category.revision, [note.sourcePath]: note.revision },
    }), repository.root, 'dart');
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe('unknown_topic');
    expect(await repository.read(category.sourcePath)).toBe(beforeCategory);
    expect(await repository.read(note.sourcePath)).toBe(beforeNote);
  });
});
