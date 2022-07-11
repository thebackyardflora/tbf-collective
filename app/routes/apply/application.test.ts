import { action } from './application';
import { faker } from '@faker-js/faker';
import { formDataFromObject } from '~/utils';
import { redirect } from '@remix-run/node';
import { prismaMock } from '~/test/prisma-mock';
import { sessionMock } from '~/test/session-mock';
import { CompanyType } from '@prisma/client';
import { createTestFloristApplicationFormData } from '~/test/utils';
import * as company from '~/models/company.server';
import * as application from '~/models/application.server';

vi.mock('~/models/company.server');
const { upsertCompany } = vi.mocked(company);

vi.mock('~/models/application.server');
const { upsertApplication } = vi.mocked(application);

describe('florist application', () => {
  beforeEach(() => {
    upsertCompany.mockClear();
    upsertApplication.mockClear();
  });

  test('a successful submission creates an application and redirects to the review page', async () => {
    prismaMock.$transaction.mockImplementation(async (fn) => {
      return await fn(prismaMock);
    });
    const userId = faker.random.numeric(1);
    const formData = createTestFloristApplicationFormData();
    sessionMock.requireUserId.mockResolvedValue(userId);

    const result = await action({
      request: new Request(`${faker.internet.url()}/apply/application?type=${CompanyType.FLORIST}`, {
        body: formDataFromObject(formData),
        method: 'POST',
      }),
      context: {},
      params: {},
    });

    const { accessToCooler, ...parsedData } = formData;
    const data = { ...parsedData, accessToCooler: true };

    expect(sessionMock.requireUserId).toHaveBeenCalledOnce();
    expect(prismaMock.$transaction).toHaveBeenCalledOnce();
    expect(upsertApplication).toHaveBeenCalledOnce();
    expect(upsertApplication).toHaveBeenCalledWith(
      {
        userId,
        payloadJson: data,
        type: CompanyType.FLORIST,
      },
      prismaMock
    );
    expect(upsertCompany).toHaveBeenCalledOnce();
    expect(upsertCompany).toHaveBeenCalledWith(
      {
        ownerId: userId,
        ownerName: parsedData.businessOwnerName,
        name: parsedData.businessName,
        email: parsedData.email,
        phone: parsedData.phone,
        type: 'FLORIST',
        address: parsedData.businessAddress,
        einTin: parsedData.einTin,
      },
      prismaMock
    );
    expect(result).toStrictEqual(redirect('/apply/review'));
  });
});
