import { createOrderRequestItem } from './order-request-item.server';
import { faker } from '@faker-js/faker';
import { prismaMock } from '~/test/prisma-mock';

describe('createOrderRequestItem', () => {
  it('should create a transaction to create the order request item and subtract quantity from the inventory record', async () => {
    const mockQuantity = faker.datatype.number({ min: 100, max: 200 });
    const mockAvailable = faker.datatype.number({ min: 100, max: mockQuantity });

    const orderRequestData = {
      userId: faker.datatype.uuid(),
      marketEventId: faker.datatype.uuid(),
      inventoryRecordId: faker.datatype.uuid(),
      quantity: faker.datatype.number({ min: 1, max: 100 }),
    };

    prismaMock.$transaction.mockImplementationOnce(async (callback) => {
      return callback(prismaMock) as never;
    });

    prismaMock.inventoryRecord.findUnique.mockResolvedValueOnce({
      id: orderRequestData.inventoryRecordId,
      quantity: mockQuantity,
      available: mockAvailable,
      inventoryList: {
        marketEventId: orderRequestData.marketEventId,
      },
    } as never);

    await createOrderRequestItem(orderRequestData);

    expect(prismaMock.$transaction).toHaveBeenCalled();

    expect(prismaMock.inventoryRecord.findUnique).toHaveBeenCalled();
    expect(prismaMock.inventoryRecord.findUnique).toHaveBeenCalledWith({
      where: { id: orderRequestData.inventoryRecordId },
      include: { inventoryList: { select: { marketEventId: true } } },
    });

    expect(prismaMock.inventoryRecord.update).toHaveBeenCalled();
    expect(prismaMock.inventoryRecord.update).toHaveBeenCalledWith({
      where: { id: orderRequestData.inventoryRecordId },
      data: {
        available: {
          decrement: orderRequestData.quantity,
        },
      },
    });

    expect(prismaMock.orderRequestItem.upsert).toHaveBeenCalled();
    expect(prismaMock.orderRequestItem.upsert).toHaveBeenCalledWith({
      where: {
        userId_marketEventId_inventoryRecordId: {
          userId: orderRequestData.userId,
          marketEventId: orderRequestData.marketEventId,
          inventoryRecordId: orderRequestData.inventoryRecordId,
        },
      },
      create: {
        userId: orderRequestData.userId,
        marketEventId: orderRequestData.marketEventId,
        inventoryRecordId: orderRequestData.inventoryRecordId,
        quantity: orderRequestData.quantity,
      },
      update: {
        quantity: {
          increment: orderRequestData.quantity,
        },
      },
    });
  });
});
