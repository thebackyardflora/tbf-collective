import { requireAdmin } from '~/session.server';
import type { LoaderFunction } from '@remix-run/node';
import { getApplicationByUserId } from '~/models/application.server';
import type { Application, User } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';

interface LoaderData {
  application: Application | null;
  user: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireAdmin(request);

  const application = await getApplicationByUserId(user.id);

  const data: LoaderData = { application, user };

  return data;
};

export default function Profile() {
  const { user, application } = useLoaderData<LoaderData>();

  return <ProfilePage application={application} user={user} />;
}
