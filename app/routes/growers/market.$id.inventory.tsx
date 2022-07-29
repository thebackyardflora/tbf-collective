import { PageWrapper } from '~/components/PageWrapper';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType, UnitOfMeasure } from '@prisma/client';
import { findOrCreateInventoryListByMarketId, getInventoryListByMarketId } from '~/models/inventory-list';
import invariant from 'tiny-invariant';
import { getAllCategoryItems } from '~/models/catalog-item.server';
import { useLoaderData } from '@remix-run/react';
import { useLocalDate } from '~/hooks/use-local-date';
import { InventoryListTable } from '~/components/inventory/InventoryListTable';
import { AddInventoryItemForm } from '~/components/inventory/AddInventoryItemForm';
import { useState } from 'react';
import { InstantSearch, InstantSearchSSRProvider } from 'react-instantsearch-hooks-web';
import { useAlgolia } from '~/components/AlgoliaProvider';
import { handleInventoryRecordForm } from '~/forms/inventory-record.form';

export async function loader({ request, params }: LoaderArgs) {
  const { company } = await requireActiveCompany(request, CompanyType.GROWER);

  invariant(process.env.ALGOLIA_INDEX_NAME, 'ALGOLIA_INDEX_NAME is required');

  const { id } = params;
  invariant(id);

  const inventoryList = await findOrCreateInventoryListByMarketId({ marketEventId: id, companyId: company.id });
  const catalogItems = await getAllCategoryItems();

  const catalogItemMap = catalogItems.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {} as { [id: string]: typeof catalogItems[number] });

  return json({
    inventoryList: {
      ...inventoryList,
      inventoryRecords: inventoryList.inventoryRecords.map((record) => {
        const catalogItem = catalogItemMap[record.catalogItemId];
        return {
          ...record,
          itemName: catalogItem.name,
          unit: record.unitOfMeasure === UnitOfMeasure.STEM ? 'Stems' : 'Bunches',
        };
      }),
    },
    catalogItems: catalogItems.map((catalogItem) => ({
      ...catalogItem,
      type: catalogItem.parentId ? 'Variety of ' + catalogItemMap[catalogItem.parentId].name : 'Species',
    })),
    indexName: process.env.ALGOLIA_INDEX_NAME,
  });
}

export async function action({ request, params }: ActionArgs) {
  const { company } = await requireActiveCompany(request, CompanyType.GROWER);

  const { id: marketId } = params;
  invariant(marketId);

  const inventoryList = await getInventoryListByMarketId({ marketEventId: marketId, companyId: company.id });

  if (!inventoryList) {
    throw json({ message: 'Inventory list not found' }, 404);
  }

  const formData = await request.formData();

  const action = formData.get('_action');
  const method = request.method;

  if (method.toLowerCase() === 'post' && action === 'add-item') {
    return await handleInventoryRecordForm(formData, { inventoryListId: inventoryList.id });
  }

  return null;
}

export default function MarketInventory() {
  const { inventoryList, catalogItems, indexName } = useLoaderData<typeof loader>();
  const searchClient = useAlgolia();

  const [isOpen, setIsOpen] = useState(false);

  const marketDate = useLocalDate(inventoryList.marketEvent.marketDate, { format: 'dddd, MMMM D, YYYY' });

  return (
    <PageWrapper
      title="Market Inventory"
      description={`Create your inventory list for the upcoming market on ${marketDate}`}
    >
      <InstantSearchSSRProvider>
        <InstantSearch indexName={indexName} searchClient={searchClient}>
          <AddInventoryItemForm isOpen={isOpen} setIsOpen={setIsOpen} catalogItems={catalogItems} />
        </InstantSearch>
      </InstantSearchSSRProvider>
      <InventoryListTable
        className="mt-4"
        inventoryRecords={inventoryList.inventoryRecords}
        onAddInventoryRecord={() => setIsOpen(true)}
      />
    </PageWrapper>
  );
}
