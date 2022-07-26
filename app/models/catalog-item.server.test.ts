import { createCatalogItem } from '~/models/catalog-item.server';
import { prismaMock } from '~/test/prisma-mock';
import { faker } from '@faker-js/faker';
import { algoliaIndexMock } from '~/test/algolia-mock';
import { getImageUrl } from '~/cloudinary.server';

vi.mock('~/cloudinary.server');
const mockGetImageUrl = vi.mocked(getImageUrl);

test('createCatalogItem calls prisma with the right parameters', async () => {
  const data = {
    imageUrl: faker.internet.url(),
    name: faker.commerce.productName(),
    description: faker.lorem.paragraph(),
    parentId: faker.datatype.uuid(),
  };

  const dummyResult = { ...data, id: faker.datatype.uuid() };

  const createdById = faker.datatype.uuid();

  prismaMock.catalogItem.create.mockResolvedValueOnce(dummyResult as never);

  let taskID = faker.datatype.uuid();
  algoliaIndexMock.saveObject.mockResolvedValueOnce({ taskID } as never);

  const thumbnailUrl = faker.internet.url();
  mockGetImageUrl.mockReturnValueOnce(thumbnailUrl);

  const imageKeys = [faker.word.noun()];

  await expect(createCatalogItem({ ...data, imageKeys, createdById })).resolves.toBe(dummyResult);

  expect(prismaMock.catalogItem.create).toHaveBeenCalledOnce();
  expect(prismaMock.catalogItem.create).toHaveBeenCalledWith({
    data: {
      ...data,
      createdBy: {
        connect: {
          id: createdById,
        },
      },
      images: {
        createMany: {
          data: [{ imageKey: imageKeys[0], createdById }],
        },
      },
      thumbnail: thumbnailUrl,
    },
  });

  expect(algoliaIndexMock.saveObject).toHaveBeenCalledOnce();
  expect(algoliaIndexMock.saveObject).toHaveBeenCalledWith({
    objectID: dummyResult.id,
    ...data,
  });
  expect(algoliaIndexMock.waitTask).toHaveBeenCalledOnce();
  expect(algoliaIndexMock.waitTask).toHaveBeenCalledWith(taskID);
});
