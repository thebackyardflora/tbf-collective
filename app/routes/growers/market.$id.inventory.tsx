import { PageWrapper } from '~/components/PageWrapper';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import type { InventoryRecord } from '@prisma/client';
import { CompanyType, InventoryListStatus, UnitOfMeasure } from '@prisma/client';
import {
  findOrCreateInventoryListByMarketId,
  getInventoryListByMarketId,
  setInventoryListStatus,
} from '~/models/inventory-list';
import invariant from 'tiny-invariant';
import { getAllCategoryItems } from '~/models/catalog-item.server';
import { useLoaderData } from '@remix-run/react';
import { useLocalDate } from '~/hooks/use-local-date';
import { InventoryListTable } from '~/components/inventory/InventoryListTable';
import { InventoryRecordForm } from '~/components/inventory/InventoryRecordForm';
import { useCallback, useState } from 'react';
import { InstantSearch, InstantSearchSSRProvider } from 'react-instantsearch-hooks-web';
import { useAlgolia } from '~/components/AlgoliaProvider';
import { handleInventoryRecordForm } from '~/forms/inventory-record.form';
import { deleteInventoryRecords } from '~/models/inventory-record.server';

export async function loader({ request, params }: LoaderArgs) {
  const { company } = await requireActiveCompany(request, CompanyType.GROWER);

  invariant(process.env.ALGOLIA_INDEX_NAME, 'ALGOLIA_INDEX_NAME is required!');

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
      inventoryRecords: inventoryList.inventoryRecords
        .filter((record) => Boolean(catalogItemMap[record.catalogItemId]))
        .map((record) => {
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
      type: catalogItem.parentId ? 'Variety of ' + catalogItemMap[catalogItem.parentId]?.name ?? 'Unknown' : 'Species',
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
  } else if (method.toLowerCase() === 'put' && action === 'edit-item') {
    const inventoryRecordId = formData.get('inventoryRecordId');

    if (!inventoryRecordId || typeof inventoryRecordId !== 'string') {
      return json({ message: 'Missing inventoryRecordId' }, 400);
    }

    return await handleInventoryRecordForm(formData, { inventoryListId: inventoryList.id, inventoryRecordId });
  } else if (method.toLowerCase() === 'delete' && action === 'delete-items') {
    const inventoryRecordIds = formData
      .getAll('inventoryRecordId')
      .filter((id): id is string => typeof id === 'string' && !!id);

    if (!inventoryRecordIds.length) return null;

    await deleteInventoryRecords(inventoryRecordIds);
  } else if (method.toLowerCase() === 'post' && action === 'submit-list') {
    await setInventoryListStatus(inventoryList.id, InventoryListStatus.APPROVED);
    return redirect('/growers');
  }

  return null;
}

export default function MarketInventory() {
  const { inventoryList, catalogItems, indexName } = useLoaderData<typeof loader>();
  const searchClient = useAlgolia();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Pick<
    InventoryRecord,
    'id' | 'catalogItemId' | 'quantity' | 'unitOfMeasure'
  > | null>(null);

  const marketDate = useLocalDate(inventoryList.marketEvent.marketDate, { format: 'dddd, MMMM D, YYYY' });

  const onAddRecord = useCallback(() => {
    setEditRecord(null);
    setIsFormOpen(true);
  }, []);

  const onEditRecord = useCallback(
    (record: Pick<InventoryRecord, 'id' | 'catalogItemId' | 'quantity' | 'unitOfMeasure'>) => {
      setEditRecord(record);
      setIsFormOpen(true);
    },
    []
  );

  return (
    <PageWrapper
      title="Market Inventory"
      description={`Create your inventory list for the upcoming market on ${marketDate}`}
    >
      <InstantSearchSSRProvider>
        <InstantSearch indexName={indexName} searchClient={searchClient}>
          <InventoryRecordForm
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
            catalogItems={catalogItems}
            editRecord={editRecord}
          />
        </InstantSearch>
      </InstantSearchSSRProvider>
      <InventoryListTable
        className="mt-4"
        inventoryRecords={inventoryList.inventoryRecords}
        onAddInventoryRecord={onAddRecord}
        onEditInventoryRecord={onEditRecord}
      />
    </PageWrapper>
  );
}
