import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { InventoryList, InventoryRecord } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { upsertInventoryRecord } from '~/models/inventory-record.server';
import { json } from '@remix-run/node';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { UnitOfMeasure } from '~/types';

export const inventoryRecordSchema = z.object({
  catalogItemId: z.string(),
  quantity: zfd.numeric(z.number().positive()),
  unitOfMeasure: z.nativeEnum(UnitOfMeasure),
  priceEach: zfd.numeric(z.number().positive()),
});

export const inventoryRecordValidator = withZod(inventoryRecordSchema);

export async function handleInventoryRecordForm(
  formData: FormData,
  {
    inventoryListId,
    inventoryRecordId,
  }: { inventoryListId: InventoryList['id']; inventoryRecordId?: InventoryRecord['id'] }
) {
  const validationResult = await inventoryRecordValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  try {
    const { quantity, unitOfMeasure, ...data } = validationResult.data;
    const numStems = unitOfMeasure === UnitOfMeasure.STEM ? quantity : quantity * 10;
    await upsertInventoryRecord({ inventoryListId, inventoryRecordId, quantity: numStems, ...data });
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError && err.code === 'P2002') {
      return json({ itemError: 'This item is already in your inventory list, please edit that entry instead.' });
    }
    throw json({ message: 'An error occurred while saving your inventory record.' }, 500);
  }

  return json({ itemAdded: true });
}
