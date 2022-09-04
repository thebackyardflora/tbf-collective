import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import { StorefrontOutlined } from '@mui/icons-material';

/* This example requires Tailwind CSS v2.0+ */
import { useState } from 'react';
import { Bars3Icon, ClipboardIcon, HomeIcon, RectangleStackIcon } from '@heroicons/react/24/outline';
import { Outlet, useLoaderData, useLocation } from '@remix-run/react';
import { StaticSidebar } from '~/components/StaticSidebar';
import { MobileSidebar } from '~/components/MobileSidebar';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import { getCompanyByOwnerId } from '~/models/company.server';
import { CompanyType } from '@prisma/client';

export async function loader({ request }: LoaderArgs) {
  const user = await requireAdmin(request);

  const company = await getCompanyByOwnerId(user.id);

  const showGrowerDashboardLink = company?.type === CompanyType.GROWER;

  return json({ user, showGrowerDashboardLink });
}

export default function AdminRoot() {
  const { user, showGrowerDashboardLink } = useLoaderData<typeof loader>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: 'dashboard', icon: HomeIcon, current: location.pathname.startsWith('/admin/dashboard') },
    {
      name: 'Applications',
      href: 'applications',
      icon: ClipboardIcon,
      current: location.pathname.startsWith('/admin/applications'),
    },
    {
      name: 'Market Events',
      href: 'market-events',
      icon: StorefrontOutlined,
      current: location.pathname.startsWith('/admin/market-events'),
    },
    {
      name: 'Catalog',
      href: 'catalog',
      icon: RectangleStackIcon,
      current: location.pathname.startsWith('/admin/catalog'),
    },
    ...(showGrowerDashboardLink
      ? [
          {
            name: 'Grower Dashboard',
            href: '/growers',
            icon: AgricultureIcon,
            current: false,
          },
        ]
      : []),
  ];

  return (
    <>
      <div>
        {/* Mobile sidebar for mobile */}
        <MobileSidebar user={user} navigation={navigation} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Static sidebar for desktop */}
        <StaticSidebar user={user} navigation={navigation} />

        <div className="flex flex-1 flex-col md:pl-64">
          <div className="sticky top-0 z-10 bg-white pl-1 pt-1 sm:pl-3 sm:pt-3 md:hidden">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
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
