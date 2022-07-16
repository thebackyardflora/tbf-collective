import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import { getMarketEvents } from '~/models/market-event.server';
import { MarketEventList } from '~/components/MarketEventList';
import { Link, useLoaderData, useLocation, useNavigate } from '@remix-run/react';
import { Button, ButtonGroup } from '@mando-collabs/tailwind-ui';
import { StorefrontOutlined } from '@mui/icons-material';
import { PlusIcon } from '@heroicons/react/outline';
import { json } from '@remix-run/node';

function isMarketDateFilter(filter: unknown): filter is 'upcoming' | 'past' {
  return filter === 'upcoming' || filter === 'past';
}

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  const url = new URL(request.url);

  let filterSearchParam = url.searchParams.get('filter');

  const filter = isMarketDateFilter(filterSearchParam) ? filterSearchParam : 'upcoming';

  const marketEvents = await getMarketEvents(filter);

  return json({ marketEvents });
}

export default function MarketEvents() {
  const { marketEvents } = useLoaderData<typeof loader>();
  const { search } = useLocation();
  const searchParams = new URLSearchParams(search.replace('?', ''));
  const navigate = useNavigate();

  return (
    <PageWrapper title="Market Events">
      <div className="flex items-end justify-between">
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
        <div>
          <Link to="new">
            <Button leadingIcon={PlusIcon}>New Event</Button>
          </Link>
        </div>
      </div>
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
