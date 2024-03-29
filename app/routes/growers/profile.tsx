import { requireActiveCompany } from '~/session.server';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';
import { CompanyType } from '@prisma/client';
import { handleCompanyProfileForm } from '~/forms/company-profile';
import { getSocialSitesByCompanyId } from '~/models/social-site.server';
import { handleAccountSettingsForm } from '~/forms/account-settings';
import { handleChangePasswordForm } from '~/forms/change-password';
import { json, unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/node';
import { getImageUrl } from '~/cloudinary.server';
import { createFileUploadHandler } from '~/utils';

export async function loader({ request }: LoaderArgs) {
  const { user, company } = await requireActiveCompany(request, CompanyType.GROWER);

  const socialSites = await getSocialSitesByCompanyId(company.id);

  return json({
    company: {
      ...company,
      imageUrl: company.imageKey ? getImageUrl(company.imageKey, { width: '160', height: '160', crop: 'fill' }) : null,
    },
    user,
    socialSites,
  });
}

export async function action({ request }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);

  const uploadHandler = createFileUploadHandler('companyImage', 'companies');
  const formData = await parseMultipartFormData(request, uploadHandler);

  if (formData.has('companyProfile')) {
    return await handleCompanyProfileForm(formData, user.id);
  } else if (formData.has('accountSettings')) {
    return await handleAccountSettingsForm(formData, user.id);
  } else if (formData.has('changePassword')) {
    return await handleChangePasswordForm(formData, user.id);
  }

  return null;
}

export default function Profile() {
  const { company, user, socialSites } = useLoaderData<typeof loader>();

  return <ProfilePage company={company} user={user} socialSites={socialSites} />;
}
