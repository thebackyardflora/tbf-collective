import type { CatalogItem } from '@prisma/client';
import { prisma } from '~/db.server';
import { algoliaIndex } from '~/algolia.server';
import { getImageUrl } from '~/cloudinary.server';

interface CreateCatalogItemParams {
  parentId?: CatalogItem['id'];
  name: CatalogItem['name'];
  description?: CatalogItem['description'];
  createdById: CatalogItem['createdById'];
  imageKeys: string[];
}

export async function createCatalogItem({
  createdById,
  imageKeys,
  ...data
}: CreateCatalogItemParams): Promise<CatalogItem> {
  const item = await prisma.catalogItem.create({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: createdById,
        },
      },
      thumbnail: imageKeys.length ? getImageUrl(imageKeys[0], { crop: 'fill', height: 400, width: 400 }) : null,
      images: {
        createMany: {
          data: imageKeys.map((imageKey, index) => ({
            createdById,
            imageKey,
          })),
        },
      },
    },
  });

  const { id: objectID, ...objectData } = item;
  const { taskID } = await algoliaIndex.saveObject({ objectID, ...objectData });
  await algoliaIndex.waitTask(taskID);

  return item;
}

export async function getCatalogItems() {
  return await prisma.catalogItem.findMany({ orderBy: { createdAt: 'desc' } });
}
