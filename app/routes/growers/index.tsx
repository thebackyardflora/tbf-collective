import type { LoaderArgs } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { PageWrapper } from '~/components/PageWrapper';
import { UpcomingMarket } from '~/components/UpcomingMarket';
import { getUpcomingMarketEvent } from '~/models/market-event.server';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { getInventoryListByMarketId } from '~/models/inventory-list';

export async function loader({ request }: LoaderArgs) {
  const { company } = await requireActiveCompany(request, CompanyType.GROWER);

  const upcomingMarketEvent = await getUpcomingMarketEvent();

  let isInventorySubmitted = false;

  if (upcomingMarketEvent) {
    const inventoryList = await getInventoryListByMarketId({
      companyId: company.id,
      marketEventId: upcomingMarketEvent.id,
    });

    if (inventoryList) {
      isInventorySubmitted = inventoryList.status === 'APPROVED';
    }
  }

  return json({ upcomingMarketEvent, isInventorySubmitted });
}

export default function GrowerDashboard() {
  const { upcomingMarketEvent, isInventorySubmitted } = useLoaderData<typeof loader>();
  return (
    <PageWrapper title="Dashboard">
      {upcomingMarketEvent ? (
        <UpcomingMarket
          marketEventId={upcomingMarketEvent.id}
          className="mt-4"
          marketDate={upcomingMarketEvent.marketDate}
          address={upcomingMarketEvent.address}
          isInventorySubmitted={isInventorySubmitted}
        />
      ) : (
        <div>There are no upcoming market events.</div>
      )}
    </PageWrapper>
  );
}
