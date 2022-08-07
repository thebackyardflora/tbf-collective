import type { catalogItemSchema } from './catalog-item';
import { handleCatalogItemForm } from './catalog-item';
import { formDataFromObject } from '~/utils';
import type { z } from 'zod';
import { faker } from '@faker-js/faker';
import * as catalogItemModel from '~/models/catalog-item.server';
import { redirect } from '@remix-run/node';

vi.mock('~/models/catalog-item.server');

const { upsertCatalogItem } = vi.mocked(catalogItemModel);

beforeEach(() => {
  upsertCatalogItem.mockClear();
});

test('handleCatalogItemForm creates a new catalog item', async () => {
  const data: z.infer<typeof catalogItemSchema> = {
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    basePrice: faker.datatype.number({ min: 1, max: 10, precision: 0.01 }),
  };
  const userId = faker.datatype.uuid();
  const formData = formDataFromObject(data);
  const successRedirect = faker.internet.url();

  await expect(handleCatalogItemForm({ formData, userId, successRedirect })).resolves.toStrictEqual(
    redirect(successRedirect)
  );
  expect(upsertCatalogItem).toHaveBeenCalledOnce();
  expect(upsertCatalogItem).toHaveBeenCalledWith({
    ...data,
    id: undefined,
    imagesToRemove: [],
    imageKeys: [],
    createdById: userId,
  });
});
