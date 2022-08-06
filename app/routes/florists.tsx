import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { getImageUrl } from '~/cloudinary.server';
import { AppLayout } from '~/components/layout/AppLayout';
import { Link, Outlet, useLoaderData } from '@remix-run/react';
import { getUpcomingMarketEvent } from '~/models/market-event.server';
import { ShoppingCartIcon } from '@heroicons/react/outline';
import React from 'react';

export async function loader({ request }: LoaderArgs) {
  const { user, company } = await requireFlorist(request);

  const upcomingMarket = await getUpcomingMarketEvent();

  const showCart = Boolean(upcomingMarket);

  return json({
    showCart,
    marketEventId: upcomingMarket?.id,
    user: {
      name: user.name,
      email: user.email,
      imageUrl: company.imageKey ? getImageUrl(company.imageKey) : null,
      isAdmin: user.isAdmin,
    },
  });
}

export default function FloristsLayout() {
  const { marketEventId, showCart, user } = useLoaderData<typeof loader>();

  return (
    <AppLayout
      user={user}
      headerActions={
        showCart ? (
          <Link
            to={`market/${marketEventId}/cart`}
            className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2
            focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="sr-only">View cart</span>
            <ShoppingCartIcon className="h-6 w-6" aria-hidden="true" />
          </Link>
        ) : null
      }
    >
      <Outlet />
    </AppLayout>
  );
}
