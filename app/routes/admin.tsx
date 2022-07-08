import type { LoaderFunction } from '@remix-run/node';
import { requireUser } from '~/session.server';
import { redirect } from '@remix-run/node';
import type { User } from '@prisma/client';

interface LoaderData {
  user: User;
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    return redirect('/');
  }

  const data: LoaderData = {
    user,
  };

  return data;
};

export default function AdminRoot() {
  return <div>Admin root</div>;
}
