import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import invariant from 'tiny-invariant';
import { getCatalogItemByIdWithChildren } from '~/models/catalog-item.server';
import { getImageUrl } from '~/cloudinary.server';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { PlusIcon } from '@heroicons/react/outline';
import { CatalogPage } from '~/components/catalog/CatalogPage';

export async function loader({ request, params }: LoaderArgs) {
  await requireAdmin(request);

  const catalogItemId = params.id;
  invariant(catalogItemId, 'catalogItemId is required');

  const catalogItem = await getCatalogItemByIdWithChildren(catalogItemId);

  if (!catalogItem) {
    return redirect('/admin/catalog');
  }

  return json({
    catalogItem: {
      ...catalogItem,
      images: catalogItem.images.map((image) => ({
        id: image.id,
        thumbnail: getImageUrl(image.imageKey, { width: 400, height: 400, crop: 'fill' }),
        original: getImageUrl(image.imageKey),
      })),
    },
  });
}

export default function CatalogItem() {
  const { catalogItem } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title={catalogItem.name}
      breadcrumbs={[
        { name: 'Catalog', href: '../catalog' },
        { name: `Species: ${catalogItem.name}`, href: '#' },
      ]}
      actions={
        <>
          <Link to="varieties/new" className="mr-2">
            <Button type="button" kind="secondary">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Variety
            </Button>
          </Link>
          <Link to="edit">
            <Button>Edit</Button>
          </Link>
        </>
      }
    >
      <CatalogPage showVarieties catalogItem={catalogItem} />
    </PageWrapper>
  );
}
