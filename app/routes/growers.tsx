import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';

import { Outlet, useLoaderData } from '@remix-run/react';
import { CompanyType } from '@prisma/client';
import { AppLayout } from '~/components/layout/AppLayout';
import { getImageUrl } from '~/cloudinary.server';

export async function loader({ request }: LoaderArgs) {
  const { user, company } = await requireActiveCompany(request, CompanyType.GROWER);

  return json({
    user: {
      name: user.name,
      email: user.email,
      imageUrl: company.imageKey ? getImageUrl(company.imageKey, { width: 150, height: 150 }) : null,
      isAdmin: user.isAdmin,
    },
  });
}

export default function GrowerRoot() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppLayout user={user}>
      <Outlet />
    </AppLayout>
  );
}
