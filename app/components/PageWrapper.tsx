import type { PropsWithChildren } from 'react';
import React from 'react';
import type { PageHeadingProps } from '@mando-collabs/tailwind-ui';
import { PageHeading } from '@mando-collabs/tailwind-ui';

type PageWrapperProps = PropsWithChildren<PageHeadingProps>;

export const PageWrapper: React.FC<PageWrapperProps> = ({ children, ...headingProps }) => {
  return (
    <>
      {headingProps.title ? <PageHeading {...headingProps} /> : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
    </>
  );
};
