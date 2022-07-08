import { action } from './application';
import { faker } from '@faker-js/faker';
import { formDataFromObject } from '~/utils';
import { redirect } from '@remix-run/node';
import type { z } from 'zod';
import { prismaMock } from '~/test/prisma-mock';
import { sessionMock } from '~/test/session-mock';
import { ApplicationType } from '@prisma/client';
import type { floristApplicationSchema } from '~/components/FloristApplication';

const createFloristFormData = (): z.infer<typeof floristApplicationSchema> => ({
  businessAddress: faker.address.streetAddress(true),
  businessName: faker.company.companyName(),
  businessOwnerName: faker.name.findName(),
  einTin: faker.finance.bic(),
  email: faker.internet.email(),
  instagramHandle: faker.internet.userName(),
  phone: faker.phone.number(),
  website: faker.internet.url(),
  yearsInBusiness: faker.random.numeric(1),
});

describe('florist application', () => {
  test('a successful submission creates an application and redirects to the review page', async () => {
    const userId = faker.random.numeric(1);
    const formData = createFloristFormData();
    sessionMock.requireUserId.mockResolvedValue(userId);

    const result = await action({
      request: new Request(`${faker.internet.url()}/apply/application?type=${ApplicationType.FLORIST}`, {
        body: formDataFromObject(formData),
        method: 'POST',
      }),
      context: {},
      params: {},
    });

    expect(sessionMock.requireUserId).toHaveBeenCalledOnce();
    expect(prismaMock.application.create).toHaveBeenCalledOnce();
    expect(prismaMock.application.create).toHaveBeenCalledWith({
      data: {
        userId,
        payloadJson: formData,
        type: ApplicationType.FLORIST,
      },
    });
    expect(result).toStrictEqual(redirect('/apply/review'));
  });
});
