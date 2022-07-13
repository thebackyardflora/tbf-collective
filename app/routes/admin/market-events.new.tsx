import { PageWrapper } from '~/components/PageWrapper';
import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { handleNewMarketEventForm } from '~/forms/market-event';
import { MarketEventForm } from '~/components/MarketEventForm';
import type { OptionLike } from '@mando-collabs/tailwind-ui';
import { getAddressOptions } from '~/models/address.server';
import { useLoaderData } from '@remix-run/react';
import { requireAdmin } from '~/session.server';

interface LoaderData {
  addressOptions: OptionLike[];
}

export const loader: LoaderFunction = async ({ request }) => {
  const addressOptions = await getAddressOptions();

  const data: LoaderData = {
    addressOptions,
  };

  return data;
};

export const action: ActionFunction = async ({ request }) => {
  await requireAdmin(request);

  const formData = await request.formData();

  return await handleNewMarketEventForm(formData);
};

export default function NewMarketEvent() {
  const { addressOptions } = useLoaderData<LoaderData>();

  return (
    <PageWrapper title="New Market Event">
      <MarketEventForm addressOptions={addressOptions} buttonText="Create market" />
    </PageWrapper>
  );
}
