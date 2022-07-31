import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { getCatalogItemById } from '~/models/catalog-item.server';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { PageWrapper } from '~/components/PageWrapper';
import { useLoaderData } from '@remix-run/react';
import { CatalogForm } from '~/components/catalog/CatalogForm';
import { createFileUploadHandler } from '~/utils';
import { unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/server-runtime';
import { handleCatalogItemForm } from '~/forms/catalog-item';

export async function loader({ request, params }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const { parentId } = params;
  invariant(parentId);

  const catalogItem = await getCatalogItemById(parentId);

  if (!catalogItem) {
    return redirect('/growers/catalog');
  }

  return json({
    speciesName: catalogItem.name,
    speciesId: catalogItem.id,
  });
}

export async function action({ request, params }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);
  const { parentId } = params;
  invariant(parentId);

  const uploadHandler = createFileUploadHandler('images', 'catalog-items');
  const formData = await parseMultipartFormData(request, uploadHandler);

  return await handleCatalogItemForm({
    formData,
    userId: user.id,
    successRedirect: `/growers/catalog/${parentId}`,
    parentId,
  });
}

export default function NewVarietyPage() {
  const { speciesName, speciesId } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title="New Variety"
      breadcrumbs={[
        { name: 'Catalog', href: '/growers/catalog' },
        { name: `Species: ${speciesName}`, href: `/growers/catalog/${speciesId}` },
        { name: `New`, href: '#' },
      ]}
    >
      <CatalogForm mode="CREATE" flowerType="Variety" />
    </PageWrapper>
  );
}
