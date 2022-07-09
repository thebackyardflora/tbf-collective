/* This example requires Tailwind CSS v2.0+ */
import { CalendarIcon } from '@heroicons/react/solid';
import React from 'react';
import { Link } from '@remix-run/react';
import type { Application } from '@prisma/client';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import type { SerializedEntity } from '~/types';
import { Agriculture, LocalFlorist } from '@mui/icons-material';
import { useLocalDate } from '~/hooks/use-local-date';
import { twMerge } from 'tailwind-merge';
import classNames from 'classnames';
import { payloadIsObject } from '~/utils';

export interface StackedListProps {
  applications: SerializedEntity<Application>[];
  className?: string;
}

export const ApplicationList: React.FC<StackedListProps> = ({ applications, className }) => {
  return (
    <div className={twMerge('overflow-hidden border border-primary-100 bg-white shadow sm:rounded-md', className)}>
      <ul className="divide-y divide-gray-200">
        {applications.map((application) => (
          <ApplicationListItem key={application.id} application={application} />
        ))}
      </ul>
    </div>
  );
};

function ApplicationListItem(props: { application: SerializedEntity<Application> }) {
  const createdAt = useLocalDate(props.application.createdAt);

  const businessName =
    (payloadIsObject(props.application.payloadJson) ? props.application.payloadJson.businessName : null) ??
    'Company Unknown';

  return (
    <li>
      <Link to={props.application.id} className="block hover:bg-gray-50" data-testid="application-link">
        <div className="px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-medium text-primary-600">{businessName}</p>
            <div className="ml-2 flex flex-shrink-0">
              <p
                className={classNames(
                  'inline-flex rounded-full  px-2 text-xs font-semibold leading-5 ',
                  props.application.status === ApplicationStatus.APPROVED
                    ? 'bg-green-100 text-green-800'
                    : props.application.status === ApplicationStatus.PENDING
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                )}
              >
                {props.application.status}
              </p>
            </div>
          </div>
          <div className="mt-2 sm:flex sm:justify-between">
            <div className="sm:flex">
              <p className="flex items-center text-sm capitalize text-gray-500">
                {props.application.type === ApplicationType.FLORIST ? (
                  <LocalFlorist className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                ) : (
                  <Agriculture className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                )}

                {props.application.type.toLowerCase()}
              </p>
            </div>
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <CalendarIcon className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
              <p>
                Created at <time dateTime={props.application.createdAt}>{createdAt}</time>
              </p>
            </div>
          </div>
        </div>
      </Link>
    </li>
  );
}
