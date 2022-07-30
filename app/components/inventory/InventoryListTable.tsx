import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button } from '@mando-collabs/tailwind-ui';
import { PlusIcon } from '@heroicons/react/outline';
import type { InventoryRecord } from '@prisma/client';
import type { UnitOfMeasure } from '@prisma/client';
import { Form } from '@remix-run/react';

export interface InventoryListTableProps {
  className?: string;
  onAddInventoryRecord?: () => void;
  onEditInventoryRecord?: (
    record: Pick<InventoryRecord, 'id' | 'catalogItemId' | 'quantity' | 'unitOfMeasure'>
  ) => void;
  inventoryRecords: Array<{
    id: string;
    itemName: string;
    quantity: number;
    unitOfMeasure: UnitOfMeasure;
    unit: string;
    catalogItemId: string;
  }>;
}

export const InventoryListTable: FC<InventoryListTableProps> = ({
  className,
  inventoryRecords,
  onAddInventoryRecord,
  onEditInventoryRecord,
}) => {
  const checkbox = useRef<HTMLInputElement | null>(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedRecords, setSelectedRecords] = useState<typeof inventoryRecords>([]);

  useEffect(() => {
    if (!checkbox.current) return;

    const isIndeterminate = selectedRecords.length > 0 && selectedRecords.length < inventoryRecords.length;
    setChecked(selectedRecords.length === inventoryRecords.length);
    setIndeterminate(isIndeterminate);
    checkbox.current.indeterminate = isIndeterminate;
  }, [inventoryRecords.length, selectedRecords]);

  function toggleAll() {
    setSelectedRecords(checked || indeterminate ? [] : inventoryRecords);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return (
    <div className={className}>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Catalog Items</h1>
          <p className="mt-2 text-sm text-gray-700">This is a list of items in your inventory for this next market.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Button type="button" leadingIcon={PlusIcon} onClick={onAddInventoryRecord}>
            Add item
          </Button>
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <Form
              method="delete"
              className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg"
            >
              {selectedRecords.length > 0 && (
                <div className="absolute top-0 left-12 flex h-12 items-center space-x-3 bg-gray-50 sm:left-16">
                  <Button type="submit" size="xs" kind="white" name="_action" value="delete-items">
                    {selectedRecords.length === inventoryRecords.length ? 'Delete all' : 'Delete selected'}
                  </Button>
                </div>
              )}
              <table className="min-w-full table-fixed divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative w-12 px-6 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                        ref={checkbox}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>
                    <th scope="col" className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
                      Item
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Quantity
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Unit
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {inventoryRecords.map((record) => (
                    <tr key={record.id} className={selectedRecords.includes(record) ? 'bg-gray-50' : undefined}>
                      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                        {selectedRecords.includes(record) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-primary-600" />
                        )}
                        <input
                          type="checkbox"
                          name="inventoryRecordId"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 sm:left-6"
                          value={record.id}
                          checked={selectedRecords.includes(record)}
                          onChange={(e) =>
                            setSelectedRecords(
                              e.target.checked
                                ? [...selectedRecords, record]
                                : selectedRecords.filter((p) => p !== record)
                            )
                          }
                        />
                      </td>
                      <td
                        className={classNames(
                          'whitespace-nowrap py-4 pr-3 text-sm font-medium',
                          selectedRecords.includes(record) ? 'text-primary-600' : 'text-gray-900'
                        )}
                      >
                        {record.itemName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.quantity}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{record.unit}</td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          type="button"
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => onEditInventoryRecord?.(record)}
                        >
                          Edit<span className="sr-only">, {record.itemName}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

InventoryListTable.displayName = 'InventoryListTable';
