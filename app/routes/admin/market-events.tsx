import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderFunction } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import { getMarketEvents } from '~/models/market-event.server';
import type { MarketEventWithAddress } from '~/components/MarketEventList';
import { MarketEventList } from '~/components/MarketEventList';
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import type { SerializedEntity } from '~/types';
import { ButtonGroup } from '@mando-collabs/tailwind-ui';
import { StorefrontOutlined } from '@mui/icons-material';

interface LoaderData<M = MarketEventWithAddress> {
  marketEvents: M[];
}

function isMarketDateFilter(filter: unknown): filter is 'upcoming' | 'past' {
  return filter === 'upcoming' || filter === 'past';
}

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);

  const url = new URL(request.url);

  let filterSearchParam = url.searchParams.get('filter');

  const filter = isMarketDateFilter(filterSearchParam) ? filterSearchParam : 'upcoming';

  const marketEvents = await getMarketEvents(filter);

  const data: LoaderData = {
    marketEvents,
  };

  return data;
};

export default function MarketEvents() {
  const { marketEvents } = useLoaderData<LoaderData<SerializedEntity<MarketEventWithAddress>>>();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search.replace('?', ''));
  const navigate = useNavigate();

  return (
    <PageWrapper title="Market Events">
      <ButtonGroup className="mt-4">
        <ButtonGroup.Button
          active={!searchParams.has('filter') || searchParams.get('filter') === 'upcoming'}
          onClick={() => navigate({ search: '?filter=upcoming' })}
        >
          Upcoming
        </ButtonGroup.Button>
        <ButtonGroup.Button
          active={searchParams.get('filter') === 'past'}
          onClick={() => navigate({ search: '?filter=past' })}
        >
          Past
        </ButtonGroup.Button>
      </ButtonGroup>
      {marketEvents.length ? (
        <MarketEventList className="mt-4" marketEvents={marketEvents} />
      ) : (
        <div className="mt-4 w-full rounded-lg border p-4">
          <div className="prose mx-auto text-center">
            <StorefrontOutlined className="mx-auto h-8 w-8" />
            <h3 className="mt-2">No market events</h3>
            <p className="text-gray-500">There are currently no markets for this filter.</p>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
