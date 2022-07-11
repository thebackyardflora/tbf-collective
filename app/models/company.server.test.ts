import { upsertCompany } from '~/models/company.server';
import { prismaMock } from '~/test/prisma-mock';
import { createTestCompanyCreateData } from '~/test/utils';
import { SocialSiteType } from '@prisma/client';

test('upsertCompany calls prisma with the right parameters', async () => {
  const companyData = createTestCompanyCreateData();
  await upsertCompany(companyData);

  const { website, instagramHandle, ownerId, ...rest } = companyData;

  expect(prismaMock.company.upsert).toHaveBeenCalledOnce();
  expect(prismaMock.company.upsert).toHaveBeenCalledWith({
    create: {
      ...rest,
      owner: {
        connect: {
          id: ownerId,
        },
      },
      socialSites: {
        createMany: {
          data: [
            {
              type: SocialSiteType.INSTAGRAM,
              url: `https://instagram.com/${instagramHandle}`,
            },
            {
              type: SocialSiteType.WEBSITE,
              url: website,
            },
          ],
        },
      },
    },
    update: rest,
    where: {
      ownerId,
    },
  });
});
