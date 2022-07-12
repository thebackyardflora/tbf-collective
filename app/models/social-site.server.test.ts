import { upsertSocialSite, deleteSocialSite } from '~/models/social-site.server';
import { SocialSiteType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { prismaMock } from '~/test/prisma-mock';

test('upsertSocialSite should call prisma.socialSite.upsert with the correct arguments', async () => {
  const type = SocialSiteType.INSTAGRAM;
  const companyId = faker.datatype.uuid();
  const url = faker.internet.url();

  await upsertSocialSite({ type, companyId, url });

  expect(prismaMock.socialSite.upsert).toHaveBeenCalledOnce();
  expect(prismaMock.socialSite.upsert).toHaveBeenCalledWith({
    create: {
      companyId,
      type,
      url,
    },
    update: {
      type,
      url,
    },
    where: {
      companyId_type: {
        type,
        companyId,
      },
    },
  });
});

test('deleteSocialSite should call prisma.socialSite.delete with the correct arguments', async () => {
  const type = SocialSiteType.INSTAGRAM;
  const companyId = faker.datatype.uuid();

  await deleteSocialSite({ type, companyId });

  expect(prismaMock.socialSite.deleteMany).toHaveBeenCalledOnce();
  expect(prismaMock.socialSite.deleteMany).toHaveBeenCalledWith({
    where: {
      type,
      companyId,
    },
  });
});
