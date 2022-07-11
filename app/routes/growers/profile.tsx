import { requireActiveCompany } from '~/session.server';
import type { LoaderFunction } from '@remix-run/node';
import type { User, Company } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';
import { CompanyType } from '@prisma/client';

interface LoaderData {
  company: Company;
  user: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { user, company } = await requireActiveCompany(request, CompanyType.GROWER);

  const data: LoaderData = { company, user };

  return data;
};

export default function Profile() {
  const { company, user } = useLoaderData<LoaderData>();

  return <ProfilePage company={company} user={user} />;
}
