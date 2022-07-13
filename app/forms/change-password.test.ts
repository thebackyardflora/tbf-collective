import { handleChangePasswordForm } from './change-password';
import { faker } from '@faker-js/faker';
import { formDataFromObject } from '~/utils';
import * as passwordModel from '~/models/password.server';
import { validationError } from 'remix-validated-form';

vi.mock('remix-validated-form', async () => {
  const actual = (await vi.importActual('remix-validated-form')) as Object;
  return {
    __esModule: true,
    ...actual,
    validationError: vi.fn(),
  };
});

vi.mock('~/models/password.server', async () => {
  const actual = (await vi.importActual('~/models/password.server')) as Object;
  return {
    __esModule: true,
    ...actual,
    updatePassword: vi.fn(),
  };
});

const { updatePassword } = vi.mocked(passwordModel);
const mockedValidationError = vi.mocked(validationError);

test('handleChangePasswordForm creates a new password for the user', async () => {
  const userId = faker.datatype.uuid();
  const currentPassword = faker.internet.password();
  const newPassword = faker.internet.password();

  const formData = formDataFromObject({
    currentPassword,
    newPassword,
    confirmPassword: newPassword,
  });

  await expect(handleChangePasswordForm(formData, userId)).resolves.toStrictEqual({ passwordUpdated: true });

  expect(updatePassword).toHaveBeenCalledOnce();
  expect(updatePassword).toHaveBeenCalledWith({
    userId,
    currentPassword,
    newPassword,
  });
});

test('handleChangePasswordForm throws an error if the current password is incorrect', async () => {
  const userId = faker.datatype.uuid();
  const currentPassword = faker.internet.password();
  const newPassword = faker.internet.password();

  const formData = formDataFromObject({
    currentPassword,
    newPassword,
    confirmPassword: newPassword,
  });

  updatePassword.mockRejectedValueOnce(new passwordModel.InvalidPasswordError('Test error message'));
  const fakeValidationError = faker.datatype.json();
  mockedValidationError.mockReturnValueOnce(fakeValidationError as never);

  await expect(handleChangePasswordForm(formData, userId)).resolves.toBe(fakeValidationError);

  expect(validationError).toHaveBeenCalledOnce();
  expect(validationError).toHaveBeenCalledWith({
    fieldErrors: { currentPassword: 'Test error message' },
  });
});
