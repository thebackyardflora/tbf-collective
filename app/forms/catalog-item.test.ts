import type { catalogItemSchema } from './catalog-item';
import { handleCatalogItemForm } from './catalog-item';
import { formDataFromObject } from '~/utils';
import type { z } from 'zod';
import { faker } from '@faker-js/faker';
import * as catalogItemModel from '~/models/catalog-item.server';
import { redirect } from '@remix-run/node';

vi.mock('~/models/catalog-item.server');

const { createCatalogItem } = vi.mocked(catalogItemModel);

beforeEach(() => {
  createCatalogItem.mockClear();
});

test('handleCatalogItemForm creates a new catalog item', async () => {
  const data: z.infer<typeof catalogItemSchema> = {
    imageUrl: faker.internet.url(),
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    parentId: faker.datatype.uuid(),
  };
  const userId = faker.datatype.uuid();
  const formData = formDataFromObject(data);
  const successRedirect = faker.internet.url();

  await expect(handleCatalogItemForm(formData, userId, successRedirect)).resolves.toStrictEqual(
    redirect(successRedirect)
  );
  expect(createCatalogItem).toHaveBeenCalledOnce();
  expect(createCatalogItem).toHaveBeenCalledWith({
    ...data,
    createdById: userId,
  });
});
