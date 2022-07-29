import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import { findOrCreateInventoryListByMarketId } from '~/models/inventory-list';
import invariant from 'tiny-invariant';
import { getAllCategoryItems } from '~/models/catalog-item.server';
import { useLoaderData } from '@remix-run/react';
import { useLocalDate } from '~/hooks/use-local-date';
import { InventoryListTable } from '~/components/inventory/InventoryListTable';
import { AddInventoryItemForm } from '~/components/inventory/AddInventoryItemForm';
import { useState } from 'react';

export async function loader({ request, params }: LoaderArgs) {
  const { company } = await requireActiveCompany(request, CompanyType.GROWER);

  const { id } = params;
  invariant(id);

  const inventoryList = await findOrCreateInventoryListByMarketId({ marketEventId: id, companyId: company.id });
  const catalogItems = await getAllCategoryItems();

  const catalogItemMap = catalogItems.reduce((map, item) => {
    map[item.id] = item;
    return map;
  }, {} as { [id: string]: typeof catalogItems[number] });

  return json({
    inventoryList,
    catalogItems: catalogItems.map((catalogItem) => ({
      ...catalogItem,
      type: catalogItem.parentId ? 'Variety of ' + catalogItemMap[catalogItem.parentId].name : 'Species',
    })),
  });
}

export default function MarketInventory() {
  const { inventoryList, catalogItems } = useLoaderData<typeof loader>();

  const [isOpen, setIsOpen] = useState(false);

  const marketDate = useLocalDate(inventoryList.marketEvent.marketDate, { format: 'dddd, MMMM D, YYYY' });

  return (
    <PageWrapper
      title="Market Inventory"
      description={`Create your inventory list for the upcoming market on ${marketDate}`}
    >
      <AddInventoryItemForm isOpen={isOpen} setIsOpen={setIsOpen} catalogItems={catalogItems} />
      <InventoryListTable className="mt-4" onAddInventoryRecord={() => setIsOpen(true)} />
    </PageWrapper>
  );
}
