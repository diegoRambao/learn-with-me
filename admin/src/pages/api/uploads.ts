import type { APIRoute } from 'astro';
import { assertContentType, assertLocalRequest, errorResponse, HttpError, jsonSuccess } from '../../lib/server/http-guard';
import { repositoryRoot } from '../../lib/server/repository-root';
import { stageImageUpload } from '../../lib/server/uploads';

export const prerender = false;

export const handleUploadRequest = async (request: Request, root = repositoryRoot): Promise<Response> => {
  try {
    assertLocalRequest(request, { requireToken: true });
    assertContentType(request, 'multipart');
    const data = await request.formData();
    const images = data.getAll('image');
    if (images.length !== 1 || !(images[0] instanceof File) || [...data.keys()].some((key) => key !== 'image')) {
      throw new HttpError(400, 'invalid_upload', 'Envía una única imagen en el campo “image”.');
    }
    const file = images[0];
    const asset = await stageImageUpload(root, { bytes: new Uint8Array(await file.arrayBuffer()), originalName: file.name, declaredType: file.type });
    const { originalName: _originalName, stagedPath: _stagedPath, destinationPath: _destinationPath, createdAt: _createdAt, ...publicAsset } = asset;
    return jsonSuccess(publicAsset, { status: 201, message: 'Imagen preparada. Se copiará al guardar la nota.' });
  } catch (error) {
    return errorResponse(error);
  }
};

export const POST: APIRoute = ({ request }) => handleUploadRequest(request);
