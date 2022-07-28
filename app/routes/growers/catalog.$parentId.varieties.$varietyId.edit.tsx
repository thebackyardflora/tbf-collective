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
import { getImageUrl } from '~/cloudinary.server';

export async function loader({ request, params }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const { parentId, varietyId } = params;
  invariant(parentId);
  invariant(varietyId);

  const species = await getCatalogItemById(parentId);
  const variety = await getCatalogItemById(varietyId);

  if (!species || !variety) {
    return redirect('/growers/catalog');
  }

  return json({
    speciesName: species.name,
    speciesId: species.id,
    variety: {
      ...variety,
      images: variety.images.map((image) => ({
        id: image.id,
        url: getImageUrl(image.imageKey, { width: 400, height: 400, crop: 'fill' }),
      })),
    },
  });
}

export async function action({ request, params }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);
  const { parentId, varietyId } = params;
  invariant(parentId);
  invariant(varietyId);

  const uploadHandler = createFileUploadHandler('images', 'catalog-items');
  const formData = await parseMultipartFormData(request, uploadHandler);

  return await handleCatalogItemForm({
    formData,
    userId: user.id,
    successRedirect: `/growers/catalog/${parentId}/varieties/${varietyId}`,
    parentId,
  });
}

export default function EditVarietyPage() {
  const { speciesName, speciesId, variety } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title="Edit Variety"
      breadcrumbs={[
        { name: 'Catalog', href: '/growers/catalog' },
        { name: `Species: ${speciesName}`, href: `/growers/catalog/${speciesId}` },
        { name: `Variety: ${variety.name}`, href: `/growers/catalog/${speciesId}/varieties/${variety.id}` },
        { name: `Edit`, href: '#' },
      ]}
    >
      <CatalogForm
        mode="EDIT"
        flowerType="Variety"
        initialValues={{
          name: variety.name,
          description: variety.description,
          images: variety.images,
        }}
      />
    </PageWrapper>
  );
}
