import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import invariant from 'tiny-invariant';
import { getCatalogItemByIdWithParent } from '~/models/catalog-item.server';
import { getImageUrl } from '~/cloudinary.server';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { CatalogPage } from '~/components/catalog/CatalogPage';

export async function loader({ request, params }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const { varietyId } = params;
  invariant(varietyId);

  const catalogItem = await getCatalogItemByIdWithParent(varietyId);

  if (!catalogItem) {
    return redirect('/growers/catalog');
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

export default function VarietyPage() {
  const { catalogItem } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title={catalogItem.name}
      breadcrumbs={[
        { name: 'Catalog', href: '/growers/catalog' },
        { name: `Species: ${catalogItem.parent?.name}`, href: `/growers/catalog/${catalogItem.parent?.id}` },
        { name: `Variety: ${catalogItem.name}`, href: '#' },
      ]}
      actions={
        <>
          <Link to="edit">
            <Button>Edit</Button>
          </Link>
        </>
      }
    >
      <CatalogPage catalogItem={catalogItem} />
    </PageWrapper>
  );
}
