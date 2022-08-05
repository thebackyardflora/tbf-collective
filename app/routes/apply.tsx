import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import Header from '~/components/Header';
import type { Step } from '~/components/Steps';
import { Steps } from '~/components/Steps';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireUser } from '~/session.server';
import { getApplicationByUserId } from '~/models/application.server';
import { ApplicationStatus } from '@prisma/client';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request, { takeToSignUp: true });

  const application = await getApplicationByUserId(user.id);

  return json({ user, isApproved: application?.status === ApplicationStatus.APPROVED });
}

export default function Apply() {
  const { user, isApproved } = useLoaderData<typeof loader>();
  const location = useLocation();

  const isTypeStep = location.pathname.endsWith('/apply/type');
  const isReviewStep = location.pathname.endsWith('/apply/review');

  const steps: Step[] = [
    { id: '01', name: 'Select type', href: '', status: isTypeStep ? 'current' : 'complete' },
    {
      id: '02',
      name: 'Application form',
      href: `application${location.search}`,
      disabled: isTypeStep,
      status: isTypeStep ? 'upcoming' : isReviewStep ? 'complete' : 'current',
    },
    {
      id: '03',
      name: 'Review',
      href: '#',
      status: isApproved ? 'complete' : isReviewStep ? 'current' : 'upcoming',
      disabled: true,
    },
  ];

  return (
    <>
      <Header user={user} />
      <main className="mx-auto mt-4 max-w-7xl px-4 sm:mt-8">
        <Steps steps={steps} />
        <Outlet />
      </main>
    </>
  );
}
