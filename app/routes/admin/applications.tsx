import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import { getAllApplicationsByStatus, isApplicationStatus } from '~/models/application.server';
import { ApplicationStatus } from '@prisma/client';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { ApplicationList } from '~/components/ApplicationList';
import { ButtonGroup } from '@mando-collabs/tailwind-ui';
import { FolderOpenIcon } from '@heroicons/react/24/outline';

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);
  const statusParam = url.searchParams.get('status');

  const status = isApplicationStatus(statusParam) ? statusParam : ApplicationStatus.PENDING;

  const applications = await getAllApplicationsByStatus(status);

  return json({ applications });
}

export default function Applications() {
  const { applications } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search.replace('?', ''));
  const statusParam = searchParams.get('status') ?? ApplicationStatus.PENDING;

  return (
    <PageWrapper title="Applications">
      <ButtonGroup className="mt-4">
        {Object.values(ApplicationStatus).map((status) => (
          <ButtonGroup.Button
            key={status}
            className="capitalize"
            active={status === statusParam}
            onClick={() => navigate({ search: `?status=${status}` })}
          >
            {status.toLowerCase()}
          </ButtonGroup.Button>
        ))}
      </ButtonGroup>
      {applications.length ? (
        <ApplicationList className="mt-4" applications={applications} />
      ) : (
        <div className="mt-4 w-full rounded-lg border p-4">
          <div className="prose mx-auto text-center">
            <FolderOpenIcon className="mx-auto h-8 w-8" />
            <h3 className="mt-2">No applications</h3>
            <p className="text-gray-500">There are currently no {statusParam.toLowerCase()} applications.</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
