import { prisma } from '~/db.server';
import type { MarketEvent } from '@prisma/client';

export async function getMarketEvents(marketDateFilter: 'upcoming' | 'past' = 'upcoming') {
  return await prisma.marketEvent.findMany({
    where: { marketDate: marketDateFilter === 'upcoming' ? { gte: new Date() } : { lte: new Date() } },
    include: { address: true },
    orderBy: { marketDate: 'asc' },
  });
}

interface CreateMarketEventParams {
  marketDate: Date;
  addressId?: string;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
  };
  notes?: string;
}

export async function createMarketEvent({
  address,
  addressId,
  ...params
}: CreateMarketEventParams): Promise<MarketEvent> {
  if (!addressId && !address) {
    throw new Error('addressId or address is required');
  }

  return await prisma.marketEvent.create({
    data: {
      ...params,
      ...(address ? { address: { create: address } } : { addressId: addressId! }),
    },
  });
}
