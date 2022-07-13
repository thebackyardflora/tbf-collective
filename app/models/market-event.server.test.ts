import { createMarketEvent } from '~/models/market-event.server';
import { faker } from '@faker-js/faker';
import { prismaMock } from '~/test/prisma-mock';

test('createMarketEvent calls prisma.marketEvent.create with an existing addressId', async () => {
  const marketDate = faker.date.future();
  const addressId = faker.datatype.uuid();
  const notes = faker.lorem.paragraph();

  await createMarketEvent({ marketDate, addressId, notes });

  expect(prismaMock.marketEvent.create).toHaveBeenCalledOnce();
  expect(prismaMock.marketEvent.create).toHaveBeenCalledWith({
    data: {
      marketDate,
      addressId,
      notes,
    },
  });
});
test('createMarketEvent calls prisma.marketEvent.create with a new address object', async () => {
  const marketDate = faker.date.future();
  const address = {
    street1: faker.address.streetAddress(),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
  };
  const notes = faker.lorem.paragraph();

  await createMarketEvent({ marketDate, address, notes });

  expect(prismaMock.marketEvent.create).toHaveBeenCalledOnce();
  expect(prismaMock.marketEvent.create).toHaveBeenCalledWith({
    data: {
      marketDate,
      notes,
      address: {
        create: address,
      },
    },
  });
});
