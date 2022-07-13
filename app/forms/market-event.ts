import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { createMarketEvent, updateMarketEvent } from '~/models/market-event.server';
import { redirect } from '@remix-run/node';
import type { MarketEvent } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { parseDateFromTimezone } from '~/utils';

dayjs.extend(utc);
dayjs.extend(timezone);

export const marketEventSchema = z
  .object({
    marketDate: zfd.text(z.string().regex(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
    timezone: zfd.text(z.string()),
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
  .refine((val) => val.address || val.addressId, { path: ['addressId'], message: 'An address is required' });

export const marketEventValidator = withZod(marketEventSchema);

export async function handleNewMarketEventForm(formData: FormData) {
  const validationResult = await marketEventValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  const { marketDate, timezone, ...data } = validationResult.data;

  await createMarketEvent({ ...data, marketDate: parseDateFromTimezone({ date: marketDate, timezone }) });

  return redirect('/admin/market-events');
}

export async function handleUpdateMarketEventForm(id: MarketEvent['id'], formData: FormData) {
  const validationResult = await marketEventValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  const { marketDate, timezone, ...data } = validationResult.data;

  await updateMarketEvent(id, { ...data, marketDate: parseDateFromTimezone({ date: marketDate, timezone }) });

  return null;
}
