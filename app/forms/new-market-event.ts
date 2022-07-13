import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { createMarketEvent } from '~/models/market-event.server';
import { redirect } from '@remix-run/node';

export const newMarketEventSchema = z
  .object({
    marketDate: zfd.text(z.string().regex(/\d{4}-\d{2}-\d{2}/)),
    addressId: zfd.text(z.string().optional()),
    address: z
      .object({
        street1: zfd.text(z.string()),
        street2: zfd.text(z.string().optional()),
        city: zfd.text(z.string()),
        state: zfd.text(z.string()),
        zip: zfd.text(z.string()),
      })
      .optional(),
    notes: zfd.text(z.string().optional()),
  })
  .refine(
    (val) => {
      console.log(val);
      return val.address || val.addressId;
    },
    { path: ['addressId'], message: 'An address is required' }
  );

export const newMarketEventValidator = withZod(newMarketEventSchema);

export async function handleNewMarketEventForm(formData: FormData) {
  const validationResult = await newMarketEventValidator.validate(formData);

  if (validationResult.error) {
    console.log('error', validationResult.error);
    return validationError(validationResult.error);
  }

  const { marketDate, ...data } = validationResult.data;

  await createMarketEvent({ ...data, marketDate: new Date(marketDate) });

  return redirect('/admin/market-events');
}
