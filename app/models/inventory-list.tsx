import { prisma } from '~/db.server';
import type { Company, InventoryListStatus, MarketEvent } from '@prisma/client';

export async function findOrCreateInventoryListByMarketId({
  companyId,
  marketEventId,
}: {
  companyId: string;
  marketEventId: string;
}) {
  const inventoryList = await prisma.inventoryList.findUnique({
    where: { marketEventId_companyId: { companyId, marketEventId } },
    include: { marketEvent: true, inventoryRecords: true },
  });

  if (inventoryList) return inventoryList;

  return await prisma.inventoryList.create({
    data: {
      marketEventId,
      companyId,
    },
    include: {
      marketEvent: true,
      inventoryRecords: true,
    },
  });
}

export function getInventoryListByMarketId({
  companyId,
  marketEventId,
}: {
  companyId: Company['id'];
  marketEventId: MarketEvent['id'];
}) {
  return prisma.inventoryList.findUnique({
    where: {
      marketEventId_companyId: {
        marketEventId,
        companyId,
      },
    },
  });
}

export function setInventoryListStatus(id: string, status: InventoryListStatus) {
  return prisma.inventoryList.update({ where: { id }, data: { status } });
}
