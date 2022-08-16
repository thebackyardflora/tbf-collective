import type { CatalogItem, Prisma } from '@prisma/client';
import { prisma } from '~/db.server';
import { catalogIndex } from '~/algolia.server';
import { getImageUrl } from '~/cloudinary.server';

interface CreateCatalogItemParams {
  id?: CatalogItem['id'];
  parentId?: CatalogItem['parentId'];
  name: CatalogItem['name'];
  description?: CatalogItem['description'];
  createdById: string;
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
  const { taskID } = await catalogIndex.saveObject({ objectID, ...objectData });
  await catalogIndex.waitTask(taskID);

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

export async function getCatalogGroupsForBrowse({ marketEventId }: { marketEventId: string }) {
  const items = await prisma.catalogItem.findMany({
    where: {
      parentId: null,
      children: {
        some: {
          inventoryRecords: {
            some: {
              inventoryList: {
                marketEventId,
              },
            },
          },
        },
      },
    },
    select: {
      name: true,
      children: {
        where: {
          inventoryRecords: {
            some: {
              inventoryList: {
                marketEventId,
              },
            },
          },
        },
        select: {
          id: true,
          name: true,
          thumbnail: true,
          inventoryRecords: {
            where: {
              inventoryList: {
                marketEventId,
              },
            },
            select: {
              quantity: true,
              available: true,
              priceEach: true,
            },
          },
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return items.map((species) => {
    const varieties = species.children.map((variety) => {
      return {
        id: variety.id,
        name: variety.name,
        species: species.name,
        price: getPriceText(variety),
        imageSrc: variety.thumbnail,
      };
    });

    return {
      name: species.name,
      varieties,
    };
  });
}

export async function getCatalogItemWithInventoryInfo({
  catalogItemId,
  marketEventId,
}: {
  catalogItemId: string;
  marketEventId: string;
}) {
  const catalogItem = await prisma.catalogItem.findUnique({
    where: { id: catalogItemId },
    include: {
      images: { select: { id: true, imageKey: true }, take: 1 },
      inventoryRecords: {
        where: {
          inventoryList: {
            marketEventId,
          },
        },
        select: {
          id: true,
          available: true,
          priceEach: true,
          inventoryList: {
            select: {
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      parent: {
        select: {
          name: true,
        },
      },
    },
  });
  if (!catalogItem?.inventoryRecords.length) return null;

  return {
    name: catalogItem.name,
    species: catalogItem.parent?.name ?? 'Unknown Species',
    price: getPriceText(catalogItem),
    description: catalogItem.description,
    imageSrc: catalogItem.images[0]?.imageKey
      ? getImageUrl(catalogItem.images[0].imageKey, {
          crop: 'fill',
          height: 600,
          width: 600,
        })
      : catalogItem.thumbnail,
    imageAlt: catalogItem.name,
    growers: catalogItem.inventoryRecords.map((record) => ({
      inventoryRecordId: record.id,
      name: record.inventoryList.company.name,
      priceEach: `$${record.priceEach.toNumber().toFixed(2)} / stem`,
      available: record.available,
    })),
  };
}

function getPriceText(catalogItem: { inventoryRecords: { priceEach: Prisma.Decimal }[] }) {
  let priceMin, priceMax;

  for (const inventoryRecord of catalogItem.inventoryRecords) {
    priceMin = priceMin
      ? Math.min(priceMin, inventoryRecord.priceEach.toNumber())
      : inventoryRecord.priceEach.toNumber();
    priceMax = priceMax
      ? Math.max(priceMax, inventoryRecord.priceEach.toNumber())
      : inventoryRecord.priceEach.toNumber();
  }

  const priceRange = !priceMin
    ? 'No pricing set'
    : priceMin === priceMax
    ? `$${priceMin.toFixed(2)}`
    : `$${priceMin?.toFixed(2)} - $${priceMax?.toFixed(2)}`;

  return `${priceRange} / stem`;
}

export async function getCatalogItemsForNextMarket({ marketEventId }: { marketEventId: string }) {
  const items = await prisma.catalogItem.findMany({
    where: {
      inventoryRecords: {
        some: {
          inventoryList: {
            marketEventId,
          },
        },
      },
    },
    include: {
      inventoryRecords: {
        select: {
          priceEach: true,
        },
      },
      parent: {
        select: {
          name: true,
        },
      },
    },
  });

  return items.map((item) => ({
    ...item,
    price: getPriceText(item),
  }));
}
