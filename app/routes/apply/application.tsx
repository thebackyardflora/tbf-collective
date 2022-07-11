import type { ValidationResult } from 'remix-validated-form';
import { validationError } from 'remix-validated-form';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { prisma } from '~/db.server';
import { requireUserId } from '~/session.server';
import { CompanyType } from '@prisma/client';
import type { floristApplicationSchema } from '~/components/FloristApplication';
import FloristApplication, { floristApplicationValidator } from '~/components/FloristApplication';
import { useLoaderData } from '@remix-run/react';
import type { growerApplicationSchema } from '~/components/GrowerApplication';
import GrowerApplication, { growerApplicationValidator } from '~/components/GrowerApplication';
import { getApplicationByUserId, upsertApplication } from '~/models/application.server';
import { upsertCompany } from '~/models/company.server';
import type { z } from 'zod';

function isCompanyType(value: unknown): value is CompanyType {
  return Object.values(CompanyType).includes(value as never);
}

interface LoaderData {
  companyType: CompanyType;
}

function assertCompanyType(url: URL) {
  const companyType = url.searchParams.get('type');

  if (!isCompanyType(companyType)) {
    throw json({ message: 'Invalid application type' }, 400);
  }

  return companyType;
}

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);

  const application = await getApplicationByUserId(userId);

  if (application) {
    return redirect('/apply/review');
  }

  const companyType = assertCompanyType(url);

  const data: LoaderData = {
    companyType,
  };

  return data;
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const url = new URL(request.url);

  const companyType = assertCompanyType(url);

  let validationResult:
    | ValidationResult<z.infer<typeof floristApplicationSchema>>
    | ValidationResult<z.infer<typeof growerApplicationSchema>>;

  if (companyType === CompanyType.FLORIST) {
    validationResult = await floristApplicationValidator.validate(await request.formData());
  } else {
    validationResult = await growerApplicationValidator.validate(await request.formData());
  }

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  await prisma.$transaction(async (t) => {
    await upsertApplication({ userId, payloadJson: validationResult.data!, type: companyType }, t);
    await upsertCompany(
      {
        type: companyType,
        ownerId: userId,
        name: validationResult.data!.businessName,
        ownerName: validationResult.data!.businessOwnerName,
        email: validationResult.data!.email,
        einTin: validationResult.data!.einTin,
        address: validationResult.data!.businessAddress,
        phone: validationResult.data!.phone,
      },
      t
    );
  });

  return redirect(`${url.pathname.replace('application', 'review')}`);
};

export default function ApplicationPage() {
  const { companyType } = useLoaderData<LoaderData>();

  return (
    <>
      <p className="text-gray-500">Please fill out the following information about your business</p>
      {companyType === CompanyType.FLORIST ? <FloristApplication /> : <GrowerApplication />}
    </>
  );
}
