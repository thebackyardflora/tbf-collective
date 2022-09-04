import type { ComponentPropsWithoutRef, FC } from 'react';
import { CalendarIcon, CheckCircleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '@mando-collabs/tailwind-ui';
import type { Address } from '@prisma/client';
import { twMerge } from 'tailwind-merge';
import { useLocalDate } from '~/hooks/use-local-date';
import { Link } from 'react-router-dom';

export interface UpcomingMarketProps extends ComponentPropsWithoutRef<'div'> {
  marketEventId: string;
  marketDate: string;
  address: Pick<Address, 'street' | 'city' | 'state' | 'zip' | 'country'>;
  isInventorySubmitted: boolean;
}

export const UpcomingMarket: FC<UpcomingMarketProps> = ({
  marketDate,
  address,
  className,
  marketEventId,
  isInventorySubmitted,
  ...divProps
}) => {
  const date = useLocalDate(marketDate, { format: 'dddd, MMMM D, YYYY @ h:mm A' });

  return (
    <div className={twMerge('rounded-lg border px-8 py-4', className)} {...divProps}>
      <div className="mb-2 text-xl font-bold">Upcoming Market</div>
      <div className="mb-1 flex items-center">
        <CalendarIcon className="mr-2 h-5 w-5 text-primary-500" /> {date}
      </div>
      <div className="mb-1 flex items-center">
        <MapPinIcon className="mr-2 h-5 w-5 text-primary-500" /> {address.street}
      </div>
      {isInventorySubmitted ? (
        <div className="flex items-center">
          <CheckCircleIcon className="mr-2 h-5 w-5 text-green-800" /> Inventory list submitted
        </div>
      ) : (
        <div className="mt-4">
          <Link to={`../market/${marketEventId}/inventory`}>
            <Button>Update inventory</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
