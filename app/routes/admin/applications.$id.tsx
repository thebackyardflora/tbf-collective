import { PageWrapper } from '~/components/PageWrapper';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import invariant from 'tiny-invariant';
import { getApplicationById, setApplicationStatus } from '~/models/application.server';
import { json, redirect } from '@remix-run/node';
import { Form, useLoaderData } from '@remix-run/react';
import { payloadIsObject } from '~/utils';
import { Button } from '@mando-collabs/tailwind-ui';
import { useLocalDate } from '~/hooks/use-local-date';
import { ApplicationStatus } from '@prisma/client';
import classNames from 'classnames';
import React from 'react';
import { updateCompanyActiveStatus } from '~/models/company.server';
import { prisma } from '~/db.server';

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);

  invariant(typeof params.id === 'string');

  const application = await getApplicationById(params.id);

  if (!application) {
    return redirect('/admin/applications');
  }

  return json({ application });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdmin(request);
  const formData = await request.formData();

  invariant(typeof params.id === 'string');
  const id = params.id;

  const application = await getApplicationById(params.id);
  if (!application) throw new Error('Application not found');

  if (formData.has('accept')) {
    await prisma.$transaction(async (t) => {
      await setApplicationStatus({ id, status: ApplicationStatus.APPROVED }, t);
      await updateCompanyActiveStatus({ ownerId: application.userId, active: true }, t);
    });
  } else if (formData.has('reject')) {
    await prisma.$transaction(async (t) => {
      await setApplicationStatus({ id, status: ApplicationStatus.REJECTED }, t);
      await updateCompanyActiveStatus({ ownerId: application.userId, active: false }, t);
    });
  }

  return null;
}

export default function ApplicationReview() {
  const { application } = useLoaderData<typeof loader>();

  const businessName =
    (payloadIsObject(application.payloadJson) ? application.payloadJson.businessName : null) ?? 'Company Unknown';

  const createdAt = useLocalDate(application.createdAt);

  return (
    <PageWrapper>
      <div className="md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-start space-x-5">
          {/*
          Use vertical padding to simulate center alignment when both lines of text are one line,
          but preserve the same layout if the text wraps without making the image jump around.
        */}
          <div className="pt-1.5">
            <h1 className="flex items-center text-2xl font-bold text-gray-900">
              <span>{businessName}</span>
              <p
                className={classNames(
                  'ml-4 inline-flex  rounded-full px-2 text-xs font-semibold leading-5',
                  application.status === ApplicationStatus.APPROVED
                    ? 'bg-green-100 text-green-800'
                    : application.status === ApplicationStatus.PENDING
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                )}
              >
                {application.status}
              </p>
            </h1>
            <p className="text-sm font-medium text-gray-500">
              Applied for <span className="font-bold capitalize">{application.type.toLowerCase()}</span> on{' '}
              <time dateTime={application.createdAt}>{createdAt}</time>
            </p>
          </div>
        </div>
        <Form
          method="post"
          className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3"
        >
          <Button type="submit" kind="white" name="reject">
            Reject
          </Button>
          <Button type="submit" name="accept">
            Approve application
          </Button>
        </Form>
      </div>

      <div className="prose mt-4 sm:order-2 sm:max-w-7xl">
        <pre className="bg-primary-800">{JSON.stringify(application.payloadJson, null, 2)}</pre>
      </div>
    </PageWrapper>
  );
}
