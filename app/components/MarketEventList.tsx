/* This example requires Tailwind CSS v2.0+ */
import { CalendarIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { Link } from '@remix-run/react';
import type { SerializedEntity } from '~/types';
import { useLocalDate } from '~/hooks/use-local-date';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';
import { MapPinIcon } from '@heroicons/react/24/outline';
import type { MarketEventWithAddress } from '~/models/market-event.server';

export interface StackedListProps {
  marketEvents: SerializedEntity<MarketEventWithAddress>[];
  className?: string;
}

export const MarketEventList: React.FC<StackedListProps> = ({ marketEvents, className }) => {
  return (
    <div className={twMerge('overflow-hidden border border-primary-100 bg-white shadow sm:rounded-md', className)}>
      <ul className="divide-y divide-gray-200">
        {marketEvents.map((marketEvent) => (
          <MarketEventListItem key={marketEvent.id} marketEvent={marketEvent} />
        ))}
      </ul>
    </div>
  );
};

function MarketEventListItem(props: { marketEvent: SerializedEntity<MarketEventWithAddress> }) {
  const createdAt = useLocalDate(props.marketEvent.createdAt);

  const formattedDate = useLocalDate(props.marketEvent.marketDate, { format: 'dddd, MMMM D, YYYY' });

  return (
    <li>
      <Link to={props.marketEvent.id} className="block hover:bg-gray-50" data-testid="market-event-link">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-primary-600">{formattedDate}</p>
            <div className="ml-2 flex flex-shrink-0">
              {props.marketEvent.isCanceled ? (
                <p
                  className={classNames(
                    'inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800'
                  )}
                >
                  Cancelled
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm capitalize text-gray-500">
                <MapPinIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                {props.marketEvent.address.street}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <p>
                Created at <time dateTime={props.marketEvent.createdAt}>{createdAt}</time>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
