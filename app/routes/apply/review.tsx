import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireUserId } from '~/session.server';
import { getApplicationByUserId } from '~/models/application.server';
import { ApplicationStatus } from '@prisma/client';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';

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
      <div className="text-center">
        {status === ApplicationStatus.PENDING ? (
          <div className="prose mx-auto">
            <h2 className="text-2xl font-extrabold">Application under review</h2>
            <p className="text-gray-500">
              Please check back later. Once we've had a chance to review your application, the status on this page will
              be updated.
            </p>
          </div>
        ) : status === ApplicationStatus.APPROVED ? (
          <>
            <div className="prose mx-auto">
              <h2 className="text-2xl font-extrabold">Application approved!</h2>
              <p className="text-gray-500">Congratulations, your application has been approved!</p>
            </div>
            <Link to="/">
              <Button className="mt-4" type="button">
                Visit your dashboard
              </Button>
            </Link>
          </>
        ) : status === ApplicationStatus.REJECTED ? (
          <div className="prose mx-auto">
            <h2 className="text-2xl font-extrabold">Application rejected.</h2>
            <p className="text-gray-500">
              We're sorry, your application has been rejected. Please keep an eye out on your email for more
              information.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
}
