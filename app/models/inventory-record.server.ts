import type { InventoryRecord } from '@prisma/client';
import { prisma } from '~/db.server';

interface UpdateInventoryRecord {
  inventoryListId: string;
  catalogItemId: string;
  inventoryRecordId?: InventoryRecord['id'];
  quantity: number;
  priceEach: number;
}

export async function upsertInventoryRecord({
  inventoryListId,
  catalogItemId,
  inventoryRecordId,
  ...data
}: UpdateInventoryRecord): Promise<InventoryRecord> {
  return await prisma.inventoryRecord.upsert({
    create: {
      inventoryList: {
        connect: {
          id: inventoryListId,
        },
      },
      catalogItem: {
        connect: {
          id: catalogItemId,
        },
      },
      ...data,
      available: data.quantity,
    },
    update: {
      ...data,
    },
    where: {
      id: inventoryRecordId || '',
    },
  });
}

export async function deleteInventoryRecords(ids: string[]): Promise<void> {
  await prisma.inventoryRecord.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
}
