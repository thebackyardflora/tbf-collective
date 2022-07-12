import { requireActiveCompany } from '~/session.server';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import type { User, Company, SocialSite } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';
import { CompanyType } from '@prisma/client';
import { handleCompanyProfileForm } from '~/forms/company-profile';
import { getSocialSitesByCompanyId } from '~/models/social-site.server';
import { handleAccountSettingsForm } from '~/forms/account-settings';

interface LoaderData {
  company: Company;
  user: User;
  socialSites: SocialSite[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, company } = await requireActiveCompany(request, CompanyType.GROWER);

  const socialSites = await getSocialSitesByCompanyId(company.id);

  const data: LoaderData = { company, user, socialSites };

  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);
  const formData = await request.formData();

  if (formData.has('companyProfile')) {
    await handleCompanyProfileForm(formData, user.id);
  } else if (formData.has('accountSettings')) {
    await handleAccountSettingsForm(formData, user.id);
  }

  return null;
};

export default function Profile() {
  const { company, user, socialSites } = useLoaderData<LoaderData>();

  return <ProfilePage company={company} user={user} socialSites={socialSites} />;
}
