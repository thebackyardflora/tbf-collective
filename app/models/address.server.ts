import { prisma } from '~/db.server';
import type { OptionLike } from '@mando-collabs/tailwind-ui';

export async function getAddressOptions(): Promise<OptionLike[]> {
  const addresses = await prisma.address.findMany({ select: { street1: true, id: true } });

  return addresses.map((address) => ({ label: address.street1, value: address.id }));
}
