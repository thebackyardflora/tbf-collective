import { handleNewMarketEventForm } from '~/forms/new-market-event';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as marketEventModel from '~/models/market-event.server';
import { redirect } from '@remix-run/node';

vi.mock('~/models/market-event.server');

const { createMarketEvent } = vi.mocked(marketEventModel);

test('handleNewMarketEventForm calls createMarketEvent with the correct params', async () => {
  const data = {
    marketDate: '2020-01-01',
    addressId: faker.datatype.uuid(),
    notes: faker.lorem.paragraph(),
  };

  const formData = formDataFromObject(data);

  await expect(handleNewMarketEventForm(formData)).resolves.toStrictEqual(redirect('/admin/market-events'));

  expect(createMarketEvent).toHaveBeenCalledOnce();
  expect(createMarketEvent).toHaveBeenCalledWith({
    marketDate: new Date(data.marketDate),
    addressId: data.addressId,
    notes: data.notes,
  });
});
