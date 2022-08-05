import { PageWrapper } from '~/components/PageWrapper';
import { handleCatalogItemForm } from '~/forms/catalog-item';
import type { ActionArgs } from '@remix-run/node';
import { requireAdmin } from '~/session.server';
import { createFileUploadHandler } from '~/utils';
import { unstable_parseMultipartFormData as parseMultipartFormData } from '@remix-run/server-runtime';
import { CatalogForm } from '~/components/catalog/CatalogForm';

export async function action({ request }: ActionArgs) {
  const user = await requireAdmin(request);

  const uploadHandler = createFileUploadHandler('images', 'catalog-items');
  const formData = await parseMultipartFormData(request, uploadHandler);

  return await handleCatalogItemForm({ formData, userId: user.id, successRedirect: '/admin/catalog' });
}

export default function NewCatalogItem() {
  return (
    <PageWrapper
      title="New Catalog Item"
      breadcrumbs={[
        { name: 'Catalog', href: '../catalog' },
        { name: 'New Item', href: '#' },
      ]}
    >
      <CatalogForm />
    </PageWrapper>
  );
}
