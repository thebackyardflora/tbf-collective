import type { marketEventSchema } from '~/forms/market-event';
import { handleNewMarketEventForm, handleUpdateMarketEventForm } from '~/forms/market-event';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as marketEventModel from '~/models/market-event.server';
import { redirect } from '@remix-run/node';
import type { z } from 'zod';

vi.mock('~/models/market-event.server');

const { createMarketEvent, updateMarketEvent } = vi.mocked(marketEventModel);

test('handleNewMarketEventForm calls createMarketEvent with the correct params', async () => {
  const data: z.infer<typeof marketEventSchema> = {
    marketDate: '2020-01-01T00:00',
    timezone: 'America/New_York',
    addressId: faker.datatype.uuid(),
    notes: faker.lorem.paragraph(),
  };

  const formData = formDataFromObject(data);

  await expect(handleNewMarketEventForm(formData)).resolves.toStrictEqual(redirect('/admin/market-events'));

  expect(createMarketEvent).toHaveBeenCalledOnce();
  expect(createMarketEvent).toHaveBeenCalledWith({
    marketDate: new Date('2020-01-01T05:00'),
    addressId: data.addressId,
    notes: data.notes,
  });
});

test('handleUpdateMarketEventForm calls updateMarketEvent with the correct params', async () => {
  const id = faker.datatype.uuid();
  const data: z.infer<typeof marketEventSchema> = {
    marketDate: '2020-01-01T00:00',
    timezone: 'America/New_York',
    addressId: faker.datatype.uuid(),
    notes: faker.lorem.paragraph(),
  };

  const formData = formDataFromObject(data);

  await expect(handleUpdateMarketEventForm(id, formData)).resolves.toBeNull();

  expect(updateMarketEvent).toHaveBeenCalledOnce();
  expect(updateMarketEvent).toHaveBeenCalledWith(id, {
    marketDate: new Date('2020-01-01T05:00'),
    addressId: data.addressId,
    notes: data.notes,
  });
});
