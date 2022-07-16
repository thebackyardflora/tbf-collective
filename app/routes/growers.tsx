import type { LoaderArgs } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';

import { useState } from 'react';
import { HomeIcon, MenuIcon } from '@heroicons/react/outline';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { StaticSidebar } from '~/components/StaticSidebar';
import { MobileSidebar } from '~/components/MobileSidebar';
import { CompanyType } from '@prisma/client';
import { json } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);

  return json({ user });
}

export default function GrowerRoot() {
  const { user } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: 'dashboard',
      icon: HomeIcon,
      current: location.pathname.startsWith('/growers/dashboard'),
    },
  ];

  return (
    <>
      <div>
        {/* Mobile sidebar for mobile */}
        <MobileSidebar navigation={navigation} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} user={user} />

        {/* Static sidebar for desktop */}
        <StaticSidebar navigation={navigation} user={user} />

        <div className="flex flex-1 flex-col md:pl-64">
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <main className="flex-1">
            <div className="py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
