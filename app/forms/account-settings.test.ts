import { handleAccountSettingsForm } from '~/forms/account-settings';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as companyModel from '~/models/company.server';
import { validationError } from 'remix-validated-form';

vi.mock('~/models/company.server');
vi.mock('remix-validated-form', async () => {
  const actual = (await vi.importActual('remix-validated-form')) as Object;
  return {
    __esModule: true,
    ...actual,
    validationError: vi.fn(),
  };
});

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

  expect(result).toBeNull();
});

test('returns a validationError object if the formData is invalid', async () => {
  const fakeResult = faker.datatype.json();
  mockedValidationError.mockReturnValue(fakeResult as never);

  const ownerId = faker.datatype.uuid();

  const formData = formDataFromObject({
    fail: true,
  });

  await expect(handleAccountSettingsForm(formData, ownerId)).resolves.toBe(fakeResult);

  expect(updateCompanyPrivateInfo).not.toHaveBeenCalled();
});
