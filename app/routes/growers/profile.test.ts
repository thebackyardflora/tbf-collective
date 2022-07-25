import { action } from './profile';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as companyProfileForm from '~/forms/company-profile';
import * as accountSettingsForm from '~/forms/account-settings';
import * as changePasswordForm from '~/forms/change-password';
import { sessionMock } from '~/test/session-mock';

vi.mock('~/forms/company-profile');
vi.mock('~/forms/account-settings');
vi.mock('~/forms/change-password');

const { handleCompanyProfileForm } = vi.mocked(companyProfileForm);
const { handleAccountSettingsForm } = vi.mocked(accountSettingsForm);
const { handleChangePasswordForm } = vi.mocked(changePasswordForm);

beforeEach(() => {
  handleCompanyProfileForm.mockClear();
  handleAccountSettingsForm.mockClear();
  handleChangePasswordForm.mockClear();
});

test('action calls handleCompanyProfileForm if the button name is companyProfile', async () => {
  const id = faker.datatype.uuid();
  sessionMock.requireActiveCompany.mockResolvedValue({ user: { id: id } } as never);

  const formData = formDataFromObject({
    companyProfile: true,
  });

  formData.append('companyImage', new Blob(['<q id="a"><span id="b">hey!</span></q>'], { type: 'text/xml' }));

  const fakeResult = faker.datatype.json();
  handleCompanyProfileForm.mockResolvedValue(fakeResult as never);

  const result = await action({
    request: new Request(faker.internet.url(), {
      method: 'post',
      body: formData,
    }),
    context: {},
    params: {},
  });

  expect(handleCompanyProfileForm).toHaveBeenCalledOnce();

  expect(result).toBe(fakeResult);
});

test('action calls handleAccountSettingsForm if the button name is accountSettings', async () => {
  const id = faker.datatype.uuid();
  sessionMock.requireActiveCompany.mockResolvedValue({ user: { id: id } } as never);

  const formData = formDataFromObject({
    accountSettings: true,
  });

  const fakeResult = faker.datatype.json();
  handleAccountSettingsForm.mockResolvedValue(fakeResult as never);

  const result = await action({
    request: new Request(faker.internet.url(), { method: 'post', body: formData }),
    context: {},
    params: {},
  });

  expect(handleAccountSettingsForm).toHaveBeenCalledOnce();
  expect(handleAccountSettingsForm).toHaveBeenCalledWith(formData, id);

  expect(result).toBe(fakeResult);
});

test('action calls handleChangePasswordForm if the button name is changePassword', async () => {
  const id = faker.datatype.uuid();
  sessionMock.requireActiveCompany.mockResolvedValue({ user: { id: id } } as never);

  const formData = formDataFromObject({
    changePassword: true,
  });

  const fakeResult = faker.datatype.json();
  handleChangePasswordForm.mockResolvedValue(fakeResult as never);

  const result = await action({
    request: new Request(faker.internet.url(), { method: 'post', body: formData }),
    context: {},
    params: {},
  });

  expect(handleChangePasswordForm).toHaveBeenCalledOnce();
  expect(handleChangePasswordForm).toHaveBeenCalledWith(formData, id);

  expect(result).toBe(fakeResult);
});
