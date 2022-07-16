import { PageWrapper } from '~/components/PageWrapper';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { handleNewMarketEventForm } from '~/forms/market-event';
import { MarketEventForm } from '~/components/MarketEventForm';
import { getAddressOptions } from '~/models/address.server';
import { useLoaderData } from '@remix-run/react';
import { requireAdmin } from '~/session.server';
import { json } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const addressOptions = await getAddressOptions();

  return json({
    addressOptions,
  });
}

export async function action({ request }: ActionArgs) {
  await requireAdmin(request);

  const formData = await request.formData();

  return await handleNewMarketEventForm(formData);
}

export default function NewMarketEvent() {
  const { addressOptions } = useLoaderData<typeof loader>();

  return (
    <PageWrapper title="New Market Event">
      <MarketEventForm addressOptions={addressOptions} buttonText="Create market" />
    </PageWrapper>
  );
}
