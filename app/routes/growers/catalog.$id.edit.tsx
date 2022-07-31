import { PageWrapper } from '~/components/PageWrapper';
import { CatalogForm } from '~/components/catalog/CatalogForm';
import { parseMultipartFormData } from '@remix-run/server-runtime/dist/formData';
import { requireActiveCompany } from '~/session.server';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { CompanyType } from '@prisma/client';
import { handleCatalogItemForm } from '~/forms/catalog-item';
import { createFileUploadHandler } from '~/utils';
import invariant from 'tiny-invariant';
import { getCatalogItemById } from '~/models/catalog-item.server';
import { json, redirect } from '@remix-run/node';
import { getImageUrl } from '~/cloudinary.server';
import { useLoaderData } from '@remix-run/react';

export async function loader({ request, params }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const catalogItemId = params.id;
  invariant(catalogItemId, 'catalogItemId is required');

  const catalogItem = await getCatalogItemById(catalogItemId);

  if (!catalogItem) {
    return redirect('/growers/catalog');
  }

  return json({
    catalogItem: {
      ...catalogItem,
      images: catalogItem.images.map((image) => ({
        id: image.id,
        url: getImageUrl(image.imageKey, { width: 400, height: 400, crop: 'fill' }),
      })),
    },
  });
}

export async function action({ request, params }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);

  const catalogItemId = params.id;
  invariant(catalogItemId, 'catalogItemId is required');

  const uploadHandler = createFileUploadHandler('images', 'catalog-items');
  const formData = await parseMultipartFormData(request, uploadHandler);

  return await handleCatalogItemForm({
    formData,
    userId: user.id,
    successRedirect: '/growers/catalog',
    itemId: catalogItemId,
  });
}

export default function EditCatalogItem() {
  const { catalogItem } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title={'Edit Species'}
      breadcrumbs={[
        { name: 'Catalog', href: '/growers/catalog' },
        { name: catalogItem.name, href: `/growers/catalog/${catalogItem.id}` },
        { name: 'Edit', href: '#' },
      ]}
    >
      <CatalogForm initialValues={catalogItem} mode="EDIT" />
    </PageWrapper>
  );
}
