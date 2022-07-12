import { action } from './profile';
import { formDataFromObject } from '~/utils';
import { faker } from '@faker-js/faker';
import * as companyProfileForm from '~/forms/company-profile';
import { sessionMock } from '~/test/session-mock';

vi.mock('~/forms/company-profile');

const { handleCompanyProfileForm } = vi.mocked(companyProfileForm);

test('action calls handleCompanyProfileForm if the button name is companyProfile', async () => {
  const id = faker.datatype.uuid();
  sessionMock.requireActiveCompany.mockResolvedValue({ user: { id: id } } as never);

  const formData = formDataFromObject({
    companyProfile: true,
  });

  const result = await action({
    request: new Request(faker.internet.url(), { method: 'post', body: formData }),
    context: {},
    params: {},
  });

  expect(handleCompanyProfileForm).toHaveBeenCalledOnce();
  expect(handleCompanyProfileForm).toHaveBeenCalledWith(formData, id);

  expect(result).toBeNull();
});
