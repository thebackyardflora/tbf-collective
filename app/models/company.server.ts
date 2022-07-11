import type { Company, PrismaClient, Prisma, User } from '@prisma/client';
import { prisma } from '~/db.server';
import { SocialSiteType } from '@prisma/client';

export async function upsertCompany(
  {
    ownerId,
    instagramHandle,
    website,
    ...params
  }: Omit<Prisma.CompanyCreateInput, 'id' | 'createdAt' | 'updatedAt' | 'owner' | 'socialSites'> & {
    ownerId: string;
    instagramHandle?: string | null;
    website?: string | null;
  },
  client: PrismaClient | Prisma.TransactionClient = prisma
): Promise<Company> {
  const socialSites = createSocialSitesArray({ instagramHandle, website });

  return await client.company.upsert({
    create: {
      ...params,
      owner: { connect: { id: ownerId } },
      socialSites: socialSites.length
        ? {
            createMany: {
              data: socialSites,
            },
          }
        : undefined,
    },
    update: params,
    where: {
      ownerId,
    },
  });
}

function createSocialSitesArray({
  instagramHandle,
  website,
}: {
  instagramHandle?: string | null;
  website?: string | null;
}) {
  const socialSites = [];

  if (instagramHandle) {
    socialSites.push({
      type: SocialSiteType.INSTAGRAM,
      url: `https://instagram.com/${instagramHandle}`,
    });
  }

  if (website) {
    socialSites.push({
      type: SocialSiteType.WEBSITE,
      url: website as string,
    });
  }

  return socialSites;
}

export async function getCompanyByOwnerId(ownerId: User['id']): Promise<Company | null> {
  return await prisma.company.findUnique({ where: { ownerId } });
}

export async function updateCompanyActiveStatus(
  { ownerId, active }: { ownerId: string; active: boolean },
  client: PrismaClient | Prisma.TransactionClient = prisma
): Promise<Company> {
  return await client.company.update({
    where: { ownerId },
    data: {
      active,
    },
  });
}
