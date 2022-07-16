import { PageWrapper } from '~/components/PageWrapper';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { setMarketCancelState, getMarketEventById } from '~/models/market-event.server';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import { useLocalDate } from '~/hooks/use-local-date';
import { MarketEventForm } from '~/components/MarketEventForm';
import { getAddressOptions } from '~/models/address.server';
import { Button } from '@mando-collabs/tailwind-ui';
import { requireAdmin } from '~/session.server';
import { handleUpdateMarketEventForm } from '~/forms/market-event';
import classNames from 'classnames';
import React from 'react';

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);
  invariant(params.id, 'id is required');

  const [marketEvent, addresses] = await Promise.all([getMarketEventById({ id: params.id }), getAddressOptions()]);

  if (!marketEvent) {
    return redirect('/admin/market-events');
  }

  return json({ marketEvent, addressOptions: addresses });
}

export async function action({ request, params }: ActionArgs) {
  await requireAdmin(request);

  invariant(params.id, 'id is required');

  const formData = await request.formData();

  if (formData.has('cancelMarket')) {
    await setMarketCancelState({ id: params.id, isCanceled: true });
    return null;
  } else if (formData.has('resumeMarket')) {
    await setMarketCancelState({ id: params.id, isCanceled: false });
    return null;
  } else {
    return await handleUpdateMarketEventForm(params.id, formData);
  }
}

export default function MarketEvent() {
  const { state, submission } = useTransition();
  const { marketEvent, addressOptions } = useLoaderData<typeof loader>();

  const marketDate = useLocalDate(marketEvent.marketDate, { format: 'dddd, MMMM D, YYYY' });
  const marketDateDefaultValue = useLocalDate(marketEvent.marketDate, { format: 'YYYY-MM-DDThh:mm' });

  const isDeleting = state === 'submitting' && submission?.formData.has('cancelMarket');
  const isResuming = state === 'submitting' && submission?.formData.has('resumeMarket');

  return (
    <PageWrapper
      title={
        <>
          Market Event: {marketDate}
          {marketEvent.isCanceled ? (
            <p
              className={classNames(
                'ml-2 inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800'
              )}
            >
              {' '}
              Cancelled
            </p>
          ) : null}
        </>
      }
      actions={
        marketEvent.isCanceled ? (
          <Form className="flex-shrink-0" method="post">
            <Button type="submit" kind="white" name="resumeMarket" loading={isResuming}>
              Un-cancel market
            </Button>
          </Form>
        ) : (
          <Form className="flex-shrink-0" method="post">
            <Button type="submit" kind="destructive" name="cancelMarket" loading={isDeleting}>
              Cancel market
            </Button>
          </Form>
        )
      }
    >
      <MarketEventForm
        defaultValues={{
          marketDate: marketDateDefaultValue,
          notes: marketEvent.notes ?? undefined,
          addressId: marketEvent.addressId,
        }}
        addressOptions={addressOptions}
        buttonText="Update market"
      />
    </PageWrapper>
  );
}
