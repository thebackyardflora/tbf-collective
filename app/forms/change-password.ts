import { z } from 'zod';
import { zfd } from 'zod-form-data';
import type { User } from '@prisma/client';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { InvalidPasswordError, updatePassword } from '~/models/password.server';
import { validatePassword } from '~/utils';

export const changePasswordFormSchema = z
  .object({
    currentPassword: zfd.text(z.string()),
    newPassword: zfd.text(z.string().refine(validatePassword, 'Password must be at least 8 characters')),
    confirmPassword: zfd.text(z.string()),
  })
  .refine((val) => val.newPassword === val.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

export const changePasswordFormValidator = withZod(changePasswordFormSchema);

export async function handleChangePasswordForm(formData: FormData, userId: User['id']) {
  const validationResult = await changePasswordFormValidator.validate(formData);

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  const { currentPassword, newPassword } = validationResult.data;

  try {
    await updatePassword({ currentPassword, newPassword, userId });
  } catch (err) {
    if (err instanceof InvalidPasswordError) {
      return validationError({ fieldErrors: { currentPassword: err.message } });
    } else {
      console.error('An error occurred in handleChangePasswordForm', err);
      throw new Error('An unknown error occurred.');
    }
  }

  return { passwordUpdated: true };
}
