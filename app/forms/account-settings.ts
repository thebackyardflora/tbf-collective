import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { withZod } from '@remix-validated-form/with-zod';
import type { Company } from '@prisma/client';
import { validationError } from 'remix-validated-form';
import { updateCompanyPrivateInfo } from '~/models/company.server';

export const accountSettingsSchema = z.object({
  email: zfd.text(z.string().email()),
  phone: zfd.text(z.string().refine((value) => isValidPhoneNumber(value, 'US'), 'Please enter a valid phone number')),
  einTin: zfd.text(z.string()),
});

export const accountSettingsValidator = withZod(accountSettingsSchema);

export async function handleAccountSettingsForm(formData: FormData, ownerId: Company['ownerId']) {
  const validationResult = await accountSettingsValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  await updateCompanyPrivateInfo({ ...validationResult.data }, ownerId);

  return null;
}
