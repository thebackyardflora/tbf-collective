import { requireAdmin, requireApprovedApplication } from '~/session.server';
import type { LoaderFunction } from '@remix-run/node';
import { getApplicationByUserId } from '~/models/application.server';
import type { Application, User } from '@prisma/client';
import { ProfilePage } from '~/components/ProfilePage';
import { useLoaderData } from '@remix-run/react';
import { ApplicationType } from '@prisma/client';

interface LoaderData {
  application: Application;
  user: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireApprovedApplication(request, ApplicationType.GROWER);

  const application = await getApplicationByUserId(user.id);

  if (!application) {
    throw new Error('Application not found');
  }

  const data: LoaderData = { application, user };

  return data;
};

export default function Profile() {
  const { application, user } = useLoaderData<LoaderData>();

  return <ProfilePage application={application} user={user} />;
}
