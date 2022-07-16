import Header from '~/components/Header';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import type { LoaderArgs } from '@remix-run/node';
import { getUser } from '~/session.server';
import { getApplicationByUserId } from '~/models/application.server';
import { InlineNotification } from '~/components/InlineNotification';
import { ApplicationStatus } from '@prisma/client';
import { getCompanyByOwnerId } from '~/models/company.server';
import { json } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const user = await getUser(request);

  const [application, company] = await Promise.all([
    user ? await getApplicationByUserId(user.id) : null,
    user ? await getCompanyByOwnerId(user.id) : null,
  ]);

  return json({ user, company, application });
}

export default function Index() {
  const { user, application, company } = useLoaderData<typeof loader>();

  return (
    <>
      <Header user={user} company={company} />
      {application?.status === ApplicationStatus.PENDING ? <InlineNotification className="my-4 sm:my-8" /> : null}

      <main className="mx-auto mt-16 max-w-7xl px-4 sm:mt-24">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block xl:inline">Support</span>{' '}
            <span className="block text-primary-600 xl:inline">locally grown flowers</span>
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base text-gray-500 sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Join our southeast Idaho collective of local growers and florists. As a member of the collective, you will
            have access to a weekly wholesale floor.
          </p>
          <div className="mx-auto mt-5 max-w-md sm:flex sm:justify-center md:mt-8">
            <Link to="apply">
              <Button className="w-full" size="xl">
                Apply now
              </Button>
            </Link>
            <div className="mt-3 sm:mt-0 sm:ml-3">
              <Link to="#">
                <Button className="w-full" kind="white" size="xl">
                  Contact us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
