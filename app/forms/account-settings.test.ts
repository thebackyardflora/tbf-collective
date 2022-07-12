import { handleAccountSettingsForm } from '~/forms/account-settings';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as companyModel from '~/models/company.server';
import { validationError } from 'remix-validated-form';

vi.mock('~/models/company.server');
vi.mock('remix-validated-form', () => ({
  __esModule: true,
  ...vi.importActual('remix-validated-form'),
  validationError: vi.fn(),
}));

const { updateCompanyPrivateInfo } = vi.mocked(companyModel);
const mockedValidationError = vi.mocked(validationError);

beforeEach(() => {
  updateCompanyPrivateInfo.mockClear();
  mockedValidationError.mockClear();
});

test('handleAccountSettingsForm should call prisma.company.update with the correct arguments', async () => {
  const ownerId = faker.datatype.uuid();

  const formData = formDataFromObject({
    email: faker.internet.email(),
    phone: faker.phone.number('208-5##-1###'),
    einTin: faker.finance.bic(),
  });

  const result = await handleAccountSettingsForm(formData, ownerId);

  expect(updateCompanyPrivateInfo).toHaveBeenCalledOnce();

  expect(result).toBeUndefined();
});

test('throws a validationError object if the formData is invalid', async () => {
  mockedValidationError.mockReturnValue({ test: true } as never);

  const ownerId = faker.datatype.uuid();

  const formData = formDataFromObject({
    fail: true,
  });

  await expect(async () => await handleAccountSettingsForm(formData, ownerId)).rejects.toStrictEqual({ test: true });

  expect(updateCompanyPrivateInfo).not.toHaveBeenCalled();
});
