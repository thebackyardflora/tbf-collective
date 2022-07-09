import { AdminPageWrapper } from '~/components/AdminPageWrapper';
import type { LoaderFunction } from '@remix-run/node';
import { requireAdmin } from '~/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdmin(request);

  return null;
};

export default function AdminDashboard() {
  return <AdminPageWrapper title="Dashboard">Dashboard page</AdminPageWrapper>;
}
