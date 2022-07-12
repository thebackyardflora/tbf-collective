import type { Company, SocialSite, SocialSiteType } from '@prisma/client';
import { prisma } from '~/db.server';
import type { Prisma, PrismaClient } from '@prisma/client';

export async function upsertSocialSite(
  {
    companyId,
    type,
    url,
  }: {
    companyId: Company['id'];
    type: SocialSiteType;
    url: string;
  },
  client: PrismaClient | Prisma.TransactionClient = prisma
): Promise<SocialSite> {
  return await client.socialSite.upsert({
    create: { companyId, type, url },
    update: { type, url },
    where: {
      companyId_type: {
        type,
        companyId,
      },
    },
  });
}

export async function deleteSocialSite(
  { companyId, type }: { companyId: Company['id']; type: SocialSiteType },
  client: PrismaClient | Prisma.TransactionClient = prisma
): Promise<void> {
  await client.socialSite.deleteMany({
    where: {
      type,
      companyId,
    },
  });
}

export async function getSocialSitesByCompanyId(
  companyId: Company['id'],
  client: PrismaClient | Prisma.TransactionClient = prisma
): Promise<SocialSite[]> {
  return await client.socialSite.findMany({
    where: {
      companyId,
    },
  });
}
