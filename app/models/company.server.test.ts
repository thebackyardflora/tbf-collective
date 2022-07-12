import { updateCompanyProfile, upsertCompany } from '~/models/company.server';
import { prismaMock } from '~/test/prisma-mock';
import { createTestCompanyCreateData } from '~/test/utils';
import { SocialSiteType } from '@prisma/client';
import { faker } from '@faker-js/faker';

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

test('updateCompanyProfile calls prisma with the right parameters', async () => {
  const returnValue = { test: true };
  prismaMock.company.update.mockResolvedValue(returnValue as never);

  const data = {
    ownerId: faker.datatype.uuid(),
    name: faker.company.companyName(),
    ownerName: faker.name.findName(),
    bio: faker.lorem.paragraph(),
  };

  const result = await updateCompanyProfile(data);

  expect(prismaMock.company.update).toHaveBeenCalledOnce();
  expect(prismaMock.company.update).toHaveBeenCalledWith({
    where: {
      ownerId: data.ownerId,
    },
    data: {
      bio: data.bio,
      name: data.name,
      ownerName: data.ownerName,
    },
  });

  expect(result).toBe(returnValue);
});
