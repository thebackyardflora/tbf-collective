import { getOrderRequestItems } from '~/models/order-request-item.server';

export async function getCartItems({ userId, marketEventId }: { userId: string; marketEventId: string }) {
  const orderRequestItems = await getOrderRequestItems({ userId, marketEventId });

  return orderRequestItems.map((orderRequestItem) => ({
    id: orderRequestItem.id,
    productId: orderRequestItem.inventoryRecord.catalogItem.id,
    name: orderRequestItem.inventoryRecord.catalogItem.name,
    species: orderRequestItem.inventoryRecord.catalogItem.parent?.name,
    quantity: orderRequestItem.quantity,
    priceEach: orderRequestItem.inventoryRecord.priceEach.toFixed(2),
    farm: orderRequestItem.inventoryRecord.inventoryList.company.name,
    totalPrice: orderRequestItem.quantity * orderRequestItem.inventoryRecord.priceEach.toNumber(),
    imageSrc: orderRequestItem.inventoryRecord.catalogItem.thumbnail,
    imageAlt: orderRequestItem.inventoryRecord.catalogItem.name,
  }));
}
