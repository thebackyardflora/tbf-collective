import type { ComponentPropsWithoutRef, FC } from 'react';
import { CalendarIcon, LocationMarkerIcon } from '@heroicons/react/outline';
import { Button } from '@mando-collabs/tailwind-ui';
import type { Address } from '@prisma/client';
import { twMerge } from 'tailwind-merge';
import { useLocalDate } from '~/hooks/use-local-date';

export interface UpcomingMarketProps extends ComponentPropsWithoutRef<'div'> {
  marketDate: string;
  address: Pick<Address, 'street' | 'city' | 'state' | 'zip' | 'country'>;
}

export const UpcomingMarket: FC<UpcomingMarketProps> = ({ marketDate, address, className, ...divProps }) => {
  const date = useLocalDate(marketDate, { format: 'dddd, MMMM D, YYYY @ h:mm A' });

  return (
    <div className={twMerge('rounded-lg border px-8 py-4', className)} {...divProps}>
      <div className="mb-2 text-xl font-bold">Upcoming Market</div>
      <div className="mb-1 flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5 text-primary-500" /> {date}
      </div>
      <div className="flex items-center">
        <LocationMarkerIcon className="mr-2 h-5 w-5 text-primary-500" /> {address.street}
      </div>
      <div className="mt-4">
        <Button>Update inventory</Button>
      </div>
    </div>
  );
};
