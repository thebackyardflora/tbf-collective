import { prisma } from '~/db.server';

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
