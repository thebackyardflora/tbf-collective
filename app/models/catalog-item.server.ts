import type { CatalogItem } from '@prisma/client';
import { prisma } from '~/db.server';
import { algoliaIndex } from '~/algolia.server';

interface CreateCatalogItemParams {
  parentId?: CatalogItem['id'];
  name: CatalogItem['name'];
  description?: CatalogItem['description'];
  imageUrl?: CatalogItem['imageUrl'];
  createdById: CatalogItem['createdById'];
}

export async function createCatalogItem({ createdById, ...data }: CreateCatalogItemParams): Promise<CatalogItem> {
  const item = await prisma.catalogItem.create({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: createdById,
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
