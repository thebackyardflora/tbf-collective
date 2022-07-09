import type { LoaderFunction } from '@remix-run/node';
import { requireApprovedApplication } from '~/session.server';
import { ApplicationType } from '@prisma/client';
import { PageWrapper } from '~/components/PageWrapper';

export const loader: LoaderFunction = async ({ request }) => {
  await requireApprovedApplication(request, ApplicationType.GROWER);

  return null;
};

export default function GrowerDashboard() {
  return <PageWrapper title="Dashboard">Dashboard</PageWrapper>;
}
