import type { InventoryRecord, UnitOfMeasure } from '@prisma/client';
import { prisma } from '~/db.server';

interface UpdateInventoryRecord {
  inventoryListId: string;
  catalogItemId: string;
  inventoryRecordId?: InventoryRecord['id'];
  quantity: number;
  unitOfMeasure: UnitOfMeasure;
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
