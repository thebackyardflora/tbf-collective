import { upsertApplication } from '~/models/application.server';
import { createTestFloristApplication } from '~/test/utils';
import { faker } from '@faker-js/faker';
import { prismaMock } from '~/test/prisma-mock';

test('upsertApplication calls prisma with the right parameters', async () => {
  const userId = faker.datatype.uuid();
  const payloadJson = createTestFloristApplication();

  await upsertApplication({
    type: 'FLORIST',
    userId,
    payloadJson: payloadJson,
  });

  expect(prismaMock.application.upsert).toHaveBeenCalledOnce();
  expect(prismaMock.application.upsert).toHaveBeenCalledWith({
    create: {
      type: 'FLORIST',
      userId,
      payloadJson,
    },
    update: {
      type: 'FLORIST',
      payloadJson,
    },
    where: {
      userId,
    },
  });
});
