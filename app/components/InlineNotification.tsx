import type { FC } from 'react';
import { ClipboardIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';
import { Link } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';

export interface InlineNotificationProps {
  className?: string;
  showDismiss?: boolean;
}

export const InlineNotification: FC<InlineNotificationProps> = ({ className, showDismiss }) => {
  return (
    <div className={twMerge('mx-auto max-w-7xl px-4', className)}>
      <div className="rounded-lg bg-primary-600 p-2 shadow-lg sm:p-3">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex flex-1 flex-shrink-0 items-center">
            <span className="flex rounded-lg bg-primary-800 p-2">
              <ClipboardIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </span>
            <p className="ml-3 truncate font-medium text-white">
              <span className="md:hidden">Application under review!</span>
              <span className="hidden md:inline">Your application will be reviewed by our team shortly!</span>
            </p>
          </div>
          <div className="order-3 mt-2 w-full flex-shrink-0 sm:order-2 sm:mt-0 sm:w-auto">
            <Link to="/apply">
              <Button kind="white">View Application</Button>
            </Link>
          </div>
          {!showDismiss ? (
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                className="-mr-1 flex rounded-md p-2 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
