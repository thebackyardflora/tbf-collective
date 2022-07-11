import type { LoaderFunction } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { PageWrapper } from '~/components/PageWrapper';

export const loader: LoaderFunction = async ({ request }) => {
  await requireActiveCompany(request, CompanyType.GROWER);

  return null;
};

export default function GrowerDashboard() {
  return <PageWrapper title="Dashboard">Dashboard</PageWrapper>;
}
