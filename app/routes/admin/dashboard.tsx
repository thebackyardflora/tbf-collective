import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { requireAdmin } from '~/session.server';

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  return null;
}

export default function AdminDashboard() {
  return <PageWrapper title="Dashboard">Dashboard page</PageWrapper>;
}
