import { prisma } from '~/db.server';

export async function getMarketEvents(marketDateFilter: 'upcoming' | 'past' = 'upcoming') {
  return await prisma.marketEvent.findMany({
    where: { marketDate: marketDateFilter === 'upcoming' ? { gte: new Date() } : { lte: new Date() } },
    include: { address: true },
    orderBy: { marketDate: 'asc' },
  });
}
