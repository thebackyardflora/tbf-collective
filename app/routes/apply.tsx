import { Outlet, useLocation } from '@remix-run/react';
import Header from '~/components/Header';
import type { Step } from '~/components/Steps';
import { Steps } from '~/components/Steps';

export default function Apply() {
  const location = useLocation();

  const isApplyRoot = location.pathname.endsWith('/apply');

  const steps: Step[] = [
    { id: '01', name: 'Select type', href: '', status: isApplyRoot ? 'current' : 'complete' },
    {
      id: '02',
      name: 'Application form',
      href: location.pathname.endsWith('florist') ? 'florist' : 'grower',
      disabled: isApplyRoot,
      status: isApplyRoot ? 'upcoming' : 'current',
    },
    { id: '03', name: 'Review', href: '#', status: 'upcoming', disabled: true },
  ];

  return (
    <>
      <Header />
      <main className="mx-auto mt-4 max-w-7xl px-4 sm:mt-8">
        <Steps steps={steps} />
        <Outlet />
      </main>
    </>
  );
}
