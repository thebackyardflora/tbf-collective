import { requireAdmin } from '~/session.server';
import type { LoaderFunction } from '@remix-run/node';
import type { User } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';
import { getCompanyByOwnerId } from '~/models/company.server';
import type { Company } from '@prisma/client';

interface LoaderData {
  company: Company | null;
  user: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);

  const company = await getCompanyByOwnerId(user.id);

  const data: LoaderData = { company, user };

  return data;
};

export default function Profile() {
  const { user, company } = useLoaderData<LoaderData>();

  return <ProfilePage company={company} user={user} />;
}
