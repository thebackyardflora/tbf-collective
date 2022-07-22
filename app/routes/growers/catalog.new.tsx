import { PageWrapper } from '~/components/PageWrapper';
import { ValidatedForm } from 'remix-validated-form';
import { catalogItemFormValidator, handleCatalogItemForm } from '~/forms/catalog-item';
import { RVFButton, RVFInput, RVFTextArea } from '@mando-collabs/tailwind-ui';
import type { ActionArgs } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';

export async function action({ request }: ActionArgs) {
  const { user } = await requireActiveCompany(request, CompanyType.GROWER);

  return await handleCatalogItemForm(await request.formData(), user.id, '/growers/catalog');
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
      <ValidatedForm method="post" validator={catalogItemFormValidator} className="mt-4 space-y-4">
        <RVFInput
          type="text"
          name="name"
          label="Flower family name"
          helpText="Enter the name of the flower family (e.g. Dahlia)"
        />

        <RVFTextArea name="description" helpText="Enter a description of the flower" label="Description" />

        <RVFButton>Create</RVFButton>
      </ValidatedForm>
    </PageWrapper>
  );
}
