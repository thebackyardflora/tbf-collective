import { requireAdmin } from '~/session.server';
import type { LoaderFunction } from '@remix-run/node';
import { getApplicationByUserId } from '~/models/application.server';
import type { Application } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';

interface LoaderData {
  application: Application | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);

  const application = await getApplicationByUserId(user.id);

  const data: LoaderData = { application };

  return data;
};

export default function Profile() {
  const { application } = useLoaderData<LoaderData>();

  return <ProfilePage type={application?.type ?? null} />;
}
