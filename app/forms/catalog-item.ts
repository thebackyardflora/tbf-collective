import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { User } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { createCatalogItem } from '~/models/catalog-item.server';
import { redirect } from '@remix-run/node';

export const catalogItemSchema = z.object({
  parentId: zfd.text(z.string().optional()),
  name: zfd.text(z.string()),
  description: zfd.text(z.string().optional()),
  imageUrl: zfd.text(z.string().optional()),
});

export const catalogItemFormValidator = withZod(catalogItemSchema);

export async function handleCatalogItemForm(formData: FormData, userId: User['id'], successRedirect: string) {
  const validationResult = await catalogItemFormValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  await createCatalogItem({ ...validationResult.data, createdById: userId });

  return redirect(successRedirect);
}
