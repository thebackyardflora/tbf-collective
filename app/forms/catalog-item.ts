import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { User } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { upsertCatalogItem } from '~/models/catalog-item.server';
import { redirect } from '@remix-run/node';
import type { CatalogItem } from '@prisma/client';

export const catalogItemSchema = z.object({
  name: zfd.text(z.string()),
  description: zfd.text(z.string().optional()),
});

export const catalogItemFormValidator = withZod(catalogItemSchema);

interface HandleCatalogItemFormParams {
  formData: FormData;
  userId: User['id'];
  itemId?: CatalogItem['id'];
  successRedirect: string;
}

export async function handleCatalogItemForm({
  itemId,
  formData,
  userId,
  successRedirect,
}: HandleCatalogItemFormParams) {
  const validationResult = await catalogItemFormValidator.validate(formData);
  const imageKeys = (formData.getAll('images') as string[]).filter(Boolean);
  const imagesToRemove = formData.getAll('imagesToRemove') as string[];

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  await upsertCatalogItem({ ...validationResult.data, imageKeys, createdById: userId, id: itemId, imagesToRemove });

  return redirect(successRedirect);
}
