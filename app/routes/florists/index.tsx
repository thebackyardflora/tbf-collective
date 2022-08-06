import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { getUpcomingMarketEvent } from '~/models/market-event.server';
import { useLoaderData } from '@remix-run/react';
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import { Link } from 'react-router-dom';
import { Button } from '@mando-collabs/tailwind-ui';
import { LocalDate } from '~/components/LocalDate';
import { PageWrapper } from '~/components/PageWrapper';

export async function loader({ request }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.FLORIST);

  const upcomingMarket = await getUpcomingMarketEvent();

  return json({ upcomingMarket });
}

export default function Florists() {
  const { upcomingMarket } = useLoaderData<typeof loader>();

  return (
    <PageWrapper title="Florist Dashboard" description="Check the upcoming market and search growers' inventory.">
      <div className="mt-4">
        {upcomingMarket ? (
          <div className={'rounded-lg border px-8 py-4'}>
            <div className="mb-2 text-xl font-bold">Upcoming Market</div>
            <div className="mb-1 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary-500" />
              <LocalDate format="dddd, MMMM D, YYYY @ h:mm A">{upcomingMarket.marketDate}</LocalDate>
            </div>
            <div className="mb-1 flex items-center">
              <LocationMarkerIcon className="mr-2 h-5 w-5 text-primary-500" /> {upcomingMarket.address.street}
            </div>

            <div className="mt-4">
              <Link to={`market/${upcomingMarket.id}/browse`}>
                <Button>Browse inventory</Button>
              </Link>
            </div>
          </div>
        ) : (
          <p>There are no upcoming markets</p>
        )}
      </div>
    </PageWrapper>
  );
}
