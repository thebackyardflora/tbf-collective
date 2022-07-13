import { prisma } from '~/db.server';
import type { MarketEvent } from '@prisma/client';
import type { Address } from '@prisma/client';

export type MarketEventWithAddress = MarketEvent & {
  address: Address;
};

export async function getMarketEvents(marketDateFilter: 'upcoming' | 'past' = 'upcoming') {
  return await prisma.marketEvent.findMany({
    where: { marketDate: marketDateFilter === 'upcoming' ? { gte: new Date() } : { lte: new Date() } },
    include: { address: true },
    orderBy: { marketDate: 'asc' },
  });
}

interface MarketEventParams {
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

export async function createMarketEvent({ address, addressId, ...params }: MarketEventParams): Promise<MarketEvent> {
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

export async function updateMarketEvent(
  id: MarketEvent['id'],
  { address, addressId, ...params }: MarketEventParams
): Promise<MarketEvent> {
  if (!addressId && !address) {
    throw new Error('addressId or address is required');
  }

  return await prisma.marketEvent.update({
    where: { id },
    data: {
      ...params,
      ...(address ? { address: { create: address } } : { addressId: addressId! }),
    },
  });
}

export async function getMarketEventById({ id }: { id: string }): Promise<MarketEventWithAddress | null> {
  return await prisma.marketEvent.findUnique({
    where: { id },
    include: { address: true },
  });
}

export async function setMarketCancelState({ id, isCanceled }: { id: string; isCanceled: boolean }): Promise<void> {
  await prisma.marketEvent.update({ where: { id }, data: { isCanceled } });
}
