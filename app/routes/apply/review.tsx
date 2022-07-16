import type { LoaderArgs } from '@remix-run/node';
import { requireUserId } from '~/session.server';
import { getApplicationByUserId } from '~/models/application.server';
import { json, redirect } from '@remix-run/node';
import { ApplicationStatus } from '@prisma/client';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request);
  const application = await getApplicationByUserId(userId);

  if (!application) {
    return redirect('/apply/type');
  }

  return json({ status: application.status });
}

export default function ApplicationReview() {
  const { status } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="prose mx-auto text-center">
        {status === ApplicationStatus.PENDING ? (
          <>
            <h2 className="text-2xl font-extrabold">Application under review</h2>
            <p className="text-gray-500">
              Please check back later. Once we've had a chance to review your application, the status on this page will
              be updated.
            </p>
          </>
        ) : status === ApplicationStatus.APPROVED ? (
          <>
            <h2 className="text-2xl font-extrabold">Application approved!</h2>
            <p className="text-gray-500">
              Congratulations, your application has been approved! Check your email for next steps.
            </p>
          </>
        ) : status === ApplicationStatus.REJECTED ? (
          <>
            <h2 className="text-2xl font-extrabold">Application rejected.</h2>
            <p className="text-gray-500">
              We're sorry, your application has been rejected. Please keep an eye out on your email for more
              information.
            </p>
          </>
        ) : null}
      </div>
    </>
  );
}
