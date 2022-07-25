import type { CommonTransformationOptions } from 'cloudinary';
import cloudinary from 'cloudinary';
import { writeAsyncIterableToWritable } from '@remix-run/node';
import invariant from 'tiny-invariant';

const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CATALOG_CLOUD_NAME } = process.env;

invariant(CLOUDINARY_API_KEY, 'CLOUDINARY_API_KEY is required');
invariant(CLOUDINARY_API_SECRET, 'CLOUDINARY_API_SECRET is required');
invariant(CLOUDINARY_CATALOG_CLOUD_NAME, 'CLOUDINARY_CATALOG_CLOUD_NAME is required');

cloudinary.v2.config({
  cloud_name: CLOUDINARY_CATALOG_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const folderPrefix = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

async function uploadImage(
  data: AsyncIterable<Uint8Array>,
  folder: string
): Promise<cloudinary.UploadApiResponse | undefined> {
  return new Promise(async (resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      {
        folder: `${folderPrefix}/${folder}`,
        format: 'jpg',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result);
      }
    );
    await writeAsyncIterableToWritable(data, uploadStream);
  });
}

export function getImageUrl(publicId: string, options: CommonTransformationOptions): string {
  return cloudinary.v2.url(publicId, options);
}

export { uploadImage };
