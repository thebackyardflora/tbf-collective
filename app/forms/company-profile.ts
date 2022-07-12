import { z } from 'zod';
import { withZod } from '@remix-validated-form/with-zod';
import type { User } from '@prisma/client';
import { validationError } from 'remix-validated-form';
import { updateCompanyProfile } from '~/models/company.server';
import { prisma } from '~/db.server';
import { zfd } from 'zod-form-data';
import { deleteSocialSite, upsertSocialSite } from '~/models/social-site.server';
import { SocialSiteType } from '@prisma/client';
import { getInstagramUrl } from '~/utils';

export const companyProfileSchema = z.object({
  name: z.string(),
  ownerName: z.string(),
  bio: zfd.text(z.string().optional()),
  instagramHandle: z.string().optional(),
  website: z.string().optional(),
});

export const companyProfileValidator = withZod(companyProfileSchema);

export async function handleCompanyProfileForm(formData: FormData, ownerId: User['id']) {
  const validationResult = await companyProfileValidator.validate(await formData);

  if (validationResult.error) {
    throw validationError(validationResult.error);
  }

  const { instagramHandle, website, ...data } = validationResult.data;

  await prisma.$transaction(async (client) => {
    const company = await updateCompanyProfile({ ownerId, ...data }, client);
    if (website) {
      await upsertSocialSite({ companyId: company.id, type: SocialSiteType.WEBSITE, url: website }, client);
    } else {
      await deleteSocialSite({ companyId: company.id, type: SocialSiteType.WEBSITE }, client);
    }

    if (instagramHandle) {
      await upsertSocialSite(
        { companyId: company.id, type: SocialSiteType.INSTAGRAM, url: getInstagramUrl(instagramHandle) },
        client
      );
    } else {
      await deleteSocialSite({ companyId: company.id, type: SocialSiteType.INSTAGRAM }, client);
    }
  });

  return null;
}
