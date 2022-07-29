import type { CatalogItem } from '@prisma/client';
import { prisma } from '~/db.server';
import { algoliaIndex } from '~/algolia.server';
import { getImageUrl } from '~/cloudinary.server';

interface CreateCatalogItemParams {
  id?: CatalogItem['id'];
  parentId?: CatalogItem['parentId'];
  name: CatalogItem['name'];
  description?: CatalogItem['description'];
  createdById: CatalogItem['createdById'];
  imageKeys: string[];
  imagesToRemove?: string[];
}

export async function upsertCatalogItem({
  id,
  createdById,
  imageKeys,
  imagesToRemove,
  parentId,
  ...data
}: CreateCatalogItemParams): Promise<CatalogItem> {
  const thumbnail = await getThumbnailForCatalogItem(id, imagesToRemove, imageKeys);

  const item = await prisma.catalogItem.upsert({
    create: {
      ...data,
      createdBy: {
        connect: {
          id: createdById,
        },
      },
      thumbnail,
      images: {
        createMany: {
          data: imageKeys.map((imageKey, index) => ({
            createdById,
            imageKey,
          })),
        },
      },
      parent: parentId
        ? {
            connect: {
              id: parentId,
            },
          }
        : undefined,
    },
    update: {
      ...data,
      thumbnail,
      lastUpdatedBy: {
        connect: {
          id: createdById,
        },
      },
      images: {
        createMany: {
          data: imageKeys.map((imageKey, index) => ({
            createdById,
            imageKey,
          })),
        },
        ...(imagesToRemove?.length ? { deleteMany: { id: { in: imagesToRemove } } } : {}),
      },
    },
    where: { id: id ?? '' },
  });

  const { id: objectID, ...objectData } = item;
  const { taskID } = await algoliaIndex.saveObject({ objectID, ...objectData });
  await algoliaIndex.waitTask(taskID);

  return item;
}

async function getThumbnailForCatalogItem(id?: string, imagesToRemove: string[] = [], imageKeys: string[] = []) {
  let thumbnailImageKey;

  if (id) {
    const image = await prisma.catalogItemImage.findFirst({
      where: {
        catalogItem: { id },
        id: { notIn: imagesToRemove },
      },
    });
    if (image) {
      thumbnailImageKey = image.imageKey;
    }
  }

  if (!thumbnailImageKey) {
    thumbnailImageKey = imageKeys.length ? imageKeys[0] : undefined;
  }

  return thumbnailImageKey ? getImageUrl(thumbnailImageKey, { crop: 'fill', height: 600, width: 600 }) : null;
}

export async function getTopLevelCategoryItems() {
  return await prisma.catalogItem.findMany({ orderBy: { createdAt: 'desc' }, where: { parentId: null } });
}

export async function getAllCategoryItems() {
  return await prisma.catalogItem.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getCatalogItemById(id: string) {
  return await prisma.catalogItem.findUnique({
    where: { id },
    include: {
      images: { select: { id: true, imageKey: true } },
    },
  });
}

export async function getCatalogItemByIdWithChildren(id: string) {
  return await prisma.catalogItem.findUnique({
    where: { id },
    include: {
      images: { select: { id: true, imageKey: true } },
      children: { select: { name: true, thumbnail: true, id: true } },
    },
  });
}

export async function getCatalogItemByIdWithParent(id: string) {
  return await prisma.catalogItem.findUnique({
    where: { id },
    include: {
      images: { select: { id: true, imageKey: true } },
      parent: { select: { id: true, name: true } },
    },
  });
}
