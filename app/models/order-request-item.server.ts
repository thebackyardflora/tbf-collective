import { prisma } from '~/db.server';

interface CreateOrderRequestItemParams {
  userId: string;
  marketEventId: string;
  inventoryRecordId: string;
  quantity: number;
}

export async function createOrderRequestItem(params: CreateOrderRequestItemParams) {
  await prisma.$transaction(async (client) => {
    const inventoryRecord = await client.inventoryRecord.findUnique({
      where: { id: params.inventoryRecordId },
      include: { inventoryList: { select: { marketEventId: true } } },
    });

    if (!inventoryRecord) {
      throw new OrderRequestError('1002');
    }

    if (params.marketEventId !== inventoryRecord.inventoryList.marketEventId) {
      throw new OrderRequestError('1001');
    }

    if (inventoryRecord.available < params.quantity) {
      throw new OrderRequestError('1003');
    }

    await client.inventoryRecord.update({
      where: { id: params.inventoryRecordId },
      data: {
        available: {
          decrement: params.quantity,
        },
      },
    });

    await client.orderRequestItem.upsert({
      where: {
        userId_marketEventId_inventoryRecordId: {
          userId: params.userId,
          marketEventId: params.marketEventId,
          inventoryRecordId: params.inventoryRecordId,
        },
      },
      create: {
        userId: params.userId,
        marketEventId: params.marketEventId,
        inventoryRecordId: params.inventoryRecordId,
        quantity: params.quantity,
      },
      update: {
        quantity: {
          increment: params.quantity,
        },
      },
    });
  });
}

export class OrderRequestError extends Error {
  constructor(public code: keyof typeof OrderRequestErrorCodeMap) {
    super(OrderRequestErrorCodeMap[code].internalMessage);
    this.name = 'OrderRequestError';
  }
}

export const OrderRequestErrorCodeMap = {
  '1001': {
    internalMessage: "The inventory item record's market event ID did not match the input market event ID",
    userMessage: 'Something went wrong with adding this item to your order.',
  },
  '1002': {
    internalMessage: 'The inventory item record does not exist.',
    userMessage: 'Something went wrong with adding this item to your order.',
  },
  '1003': {
    internalMessage: 'The quantity requested is greater than the quantity available.',
    userMessage: 'The quantity you requested is no longer available. Please adjust and try again',
  },
};

export async function getOrderRequestItems({ userId, marketEventId }: { userId: string; marketEventId: string }) {
  return await prisma.orderRequestItem.findMany({
    where: {
      userId,
      marketEventId,
    },
    select: {
      id: true,
      quantity: true,
      inventoryRecord: {
        select: {
          id: true,
          priceEach: true,
          catalogItem: {
            select: {
              id: true,
              name: true,
              thumbnail: true,
              parent: {
                select: {
                  name: true,
                },
              },
            },
          },
          inventoryList: {
            select: {
              company: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export function getOrderRequestItemCount({ userId, marketEventId }: { userId: string; marketEventId: string }) {
  return prisma.orderRequestItem.count({
    where: {
      userId,
      marketEventId,
    },
  });
}

export async function deleteOrderRequestItem({ orderRequestItemId }: { orderRequestItemId: string }) {
  await prisma.$transaction(async (client) => {
    const orderRequestItem = await client.orderRequestItem.findUnique({
      where: { id: orderRequestItemId },
    });

    if (!orderRequestItem) {
      return;
    }

    await client.inventoryRecord.update({
      where: {
        id: orderRequestItem.inventoryRecordId,
      },
      data: {
        available: {
          increment: orderRequestItem.quantity,
        },
      },
    });

    await client.orderRequestItem.delete({
      where: {
        id: orderRequestItemId,
      },
    });
  });
}
