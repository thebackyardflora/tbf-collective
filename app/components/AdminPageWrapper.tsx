import type { PropsWithChildren } from 'react';
import React from 'react';

type AdminPageWrapperProps = PropsWithChildren<{
  title?: string;
}>;

export const AdminPageWrapper: React.FC<AdminPageWrapperProps> = ({ title, children }) => {
  return (
    <>
      {title ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">{children}</div>
    </>
  );
};
