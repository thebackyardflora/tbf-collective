import type { PropsWithChildren } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PageWrapperProps = PropsWithChildren<{
  title?: string;
  titleClassName?: string;
}>;

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, titleClassName, children }) => {
  return (
    <>
      {title ? (
        <div className={twMerge('mx-auto max-w-7xl px-4 sm:px-6 md:px-8', titleClassName)}>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
    </>
  );
};
