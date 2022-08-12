import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { getImageUrl } from '~/cloudinary.server';
import { AppLayout } from '~/components/layout/AppLayout';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { getUpcomingMarketEvent } from '~/models/market-event.server';
import { ShoppingCartIcon } from '@heroicons/react/outline';
import { ShoppingCartIcon as ShoppingCartIconSolid } from '@heroicons/react/solid';
import React from 'react';
import classNames from 'classnames';
import { getOrderRequestItemCount } from '~/models/order-request-item.server';

export async function loader({ request }: LoaderArgs) {
  const { user, company } = await requireFlorist(request);

  const upcomingMarket = await getUpcomingMarketEvent();

  const showCart = Boolean(upcomingMarket);

  let orderItemCount = 0;
  if (upcomingMarket) {
    orderItemCount = await getOrderRequestItemCount({ userId: user.id, marketEventId: upcomingMarket?.id });
  }

  return json({
    showCart,
    marketEventId: upcomingMarket?.id,
    orderItemCount,
    user: {
      name: user.name,
      email: user.email,
      imageUrl: company.imageKey ? getImageUrl(company.imageKey) : null,
      isAdmin: user.isAdmin,
    },
  });
}

export default function FloristsLayout() {
  const { marketEventId, orderItemCount, showCart, user } = useLoaderData<typeof loader>();

  return (
    <AppLayout
      user={user}
      headerActions={
        showCart ? (
          <Link
            to={`market/${marketEventId}/cart`}
            className={classNames(
              'rounded-full bg-white p-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              orderItemCount > 0 ? 'text-primary-500 hover:text-primary-700' : 'text-gray-400 hover:text-gray-500'
            )}
          >
            <span className="sr-only"> View order</span>
            {orderItemCount > 0 ? (
              <ShoppingCartIconSolid className="h-6 w-6" aria-hidden="true" />
            ) : (
              <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
            )}
          </Link>
        ) : null
      }
    >
      <Outlet />
    </AppLayout>
  );
}
