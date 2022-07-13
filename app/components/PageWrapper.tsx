import type { PropsWithChildren } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PageWrapperProps = PropsWithChildren<{
  title?: React.ReactNode;
  titleClassName?: string;
  actions?: React.ReactNode;
}>;

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, titleClassName, children, actions }) => {
  return (
    <>
      {title ? (
        <div className={twMerge('mx-auto flex max-w-7xl justify-between px-4 sm:px-6 md:px-8', titleClassName)}>
          <h1 className="flex items-center text-2xl font-semibold text-gray-900">{title}</h1>
          {actions ? actions : null}
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
    </>
  );
};
