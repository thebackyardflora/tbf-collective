import type { companyProfileSchema } from './company-profile';
import { handleCompanyProfileForm } from './company-profile';
import type { z } from 'zod';
import { faker } from '@faker-js/faker';
import { formDataFromObject } from '~/utils';
import { prismaMock } from '~/test/prisma-mock';
import * as companyModel from '~/models/company.server';
import * as socialSiteModel from '~/models/social-site.server';
import { SocialSiteType } from '@prisma/client';

vi.mock('~/models/company.server');
vi.mock('~/models/social-site.server');

const { updateCompanyProfile } = vi.mocked(companyModel);
const { deleteSocialSite, upsertSocialSite } = vi.mocked(socialSiteModel);

beforeEach(() => {
  updateCompanyProfile.mockClear();
  deleteSocialSite.mockClear();
  upsertSocialSite.mockClear();
});

test('a successful submissions updates the company data', async () => {
  prismaMock.$transaction.mockImplementation((fn) => fn(prismaMock));
  const companyId = faker.datatype.uuid();
  updateCompanyProfile.mockResolvedValue({ id: companyId } as never);

  const testData: z.infer<typeof companyProfileSchema> = {
    bio: faker.lorem.paragraph(),
    website: undefined,
    instagramHandle: faker.internet.userName(),
    name: faker.company.companyName(),
    ownerName: faker.name.findName(),
  };

  const formData = formDataFromObject({ ...testData, companyProfile: true });
  const userId = faker.datatype.uuid();
  const result = await handleCompanyProfileForm(formData, userId);

  expect(prismaMock.$transaction).toHaveBeenCalledOnce();
  expect(updateCompanyProfile).toHaveBeenCalledOnce();
  expect(updateCompanyProfile).toHaveBeenCalledWith(
    {
      ownerId: userId,
      bio: testData.bio,
      name: testData.name,
      ownerName: testData.ownerName,
    },
    prismaMock
  );
  expect(deleteSocialSite).toHaveBeenCalledOnce();
  expect(deleteSocialSite).toHaveBeenCalledWith(
    {
      companyId,
      type: SocialSiteType.WEBSITE,
    },
    prismaMock
  );
  expect(upsertSocialSite).toHaveBeenCalledOnce();
  expect(upsertSocialSite).toHaveBeenCalledWith(
    {
      companyId,
      type: SocialSiteType.INSTAGRAM,
      url: `https://instagram.com/${testData.instagramHandle}`,
    },
    prismaMock
  );
  expect(result).toBe(null);
});
