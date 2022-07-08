import { validationError } from 'remix-validated-form';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/db.server';
import { requireUserId } from '~/session.server';
import { ApplicationType } from '@prisma/client';
import FloristApplication, { floristApplicationValidator } from '~/components/FloristApplication';
import { useLoaderData } from '@remix-run/react';
import GrowerApplication, { growerApplicationValidator } from '~/components/GrowerApplication';
import { getApplicationByUserId } from '~/models/application.server';

function isApplicationType(value: unknown): value is ApplicationType {
  return Object.values(ApplicationType).includes(value as never);
}

interface LoaderData {
  applicationType: ApplicationType;
}

function assertApplicationType(url: URL) {
  const applicationType = url.searchParams.get('type');

  if (!isApplicationType(applicationType)) {
    throw json({ message: 'Invalid application type' }, 400);
  }

  return applicationType;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);

  const application = await getApplicationByUserId(userId);

  if (application) {
    return redirect('/apply/review');
  }

  const applicationType = assertApplicationType(url);

  const data: LoaderData = {
    applicationType,
  };

  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);

  const applicationType = assertApplicationType(url);

  let validationResult;

  if (applicationType === ApplicationType.FLORIST) {
    validationResult = await floristApplicationValidator.validate(await request.formData());
  } else {
    validationResult = await growerApplicationValidator.validate(await request.formData());
  }

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  await prisma.application.create({
    data: {
      userId,
      payloadJson: validationResult.data,
      type: applicationType,
    },
  });

  return redirect(`${url.pathname.replace('application', 'review')}`);
};

export default function ApplicationPage() {
  const { applicationType } = useLoaderData<LoaderData>();

  return (
    <>
      <p className="text-gray-500">Please fill out the following information about your business</p>
      {applicationType === ApplicationType.FLORIST ? <FloristApplication /> : <GrowerApplication />}
    </>
  );
}
