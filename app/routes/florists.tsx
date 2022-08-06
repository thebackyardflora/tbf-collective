import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { getImageUrl } from '~/cloudinary.server';
import { AppLayout } from '~/components/layout/AppLayout';
import { Outlet, useLoaderData } from '@remix-run/react';
import { PageWrapper } from '~/components/PageWrapper';

export async function loader({ request }: LoaderArgs) {
  const { user, company } = await requireActiveCompany(request, CompanyType.FLORIST);

  return json({
    user: {
      name: user.name,
      email: user.email,
      imageUrl: company.imageKey ? getImageUrl(company.imageKey) : null,
      isAdmin: user.isAdmin,
    },
  });
}

export default function FloristsLayout() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <AppLayout user={user}>
      <PageWrapper title="Florist Dashboard" description="Check the upcoming market and search growers' inventory.">
        <Outlet />
      </PageWrapper>
    </AppLayout>
  );
}
