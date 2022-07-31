import type { LoaderArgs } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { PageWrapper } from '~/components/PageWrapper';
import { UpcomingMarket } from '~/components/UpcomingMarket';
import { getUpcomingMarketEvent } from '~/models/market-event.server';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const upcomingMarketEvent = await getUpcomingMarketEvent();

  return json({ upcomingMarketEvent: upcomingMarketEvent });
}

export default function GrowerDashboard() {
  const { upcomingMarketEvent } = useLoaderData<typeof loader>();
  return (
    <PageWrapper title="Dashboard">
      {upcomingMarketEvent ? (
        <UpcomingMarket
          marketEventId={upcomingMarketEvent.id}
          className="mt-4"
          marketDate={upcomingMarketEvent.marketDate}
          address={upcomingMarketEvent.address}
        />
      ) : (
        <div>There are no upcoming market events.</div>
      )}
    </PageWrapper>
  );
}
