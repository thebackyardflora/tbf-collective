import { Outlet, useLocation } from '@remix-run/react';
import Header from '~/components/Header';
import type { Step } from '~/components/Steps';
import { Steps } from '~/components/Steps';

export default function Apply() {
  const location = useLocation();

  const isTypeStep = location.pathname.endsWith('/apply/type');
  const isReviewStep = location.pathname.endsWith('/apply/review');

  const steps: Step[] = [
    { id: '01', name: 'Select type', href: '', status: isTypeStep ? 'current' : 'complete' },
    {
      id: '02',
      name: 'Application form',
      href: `application${location.search}`,
      disabled: isTypeStep,
      status: isTypeStep ? 'upcoming' : isReviewStep ? 'complete' : 'current',
    },
    { id: '03', name: 'Review', href: '#', status: isReviewStep ? 'current' : 'upcoming', disabled: true },
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
