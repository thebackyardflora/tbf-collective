/*
  This example requires Tailwind CSS v2.0+ 
  
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
import type { FC } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { Button, Input } from '@mando-collabs/tailwind-ui';
import type { InventoryRecord } from '@prisma/client';
import { UnitOfMeasure } from '@prisma/client';
import { SearchBox } from '~/components/SearchBox';
import { useHits, useSearchBox } from 'react-instantsearch-hooks';
import React from 'react';
import { Link, useFetcher } from '@remix-run/react';

type ListCatalogItem = {
  id: string;
  name: string;
  thumbnail: string | null;
  type: string;
};

export interface InventoryRecordFormProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  catalogItems: {
    id: string;
    name: string;
    thumbnail: string | null;
    parentId: string | null;
    type: string;
    description: string | null;
  }[];
  editRecord: Pick<InventoryRecord, 'id' | 'catalogItemId' | 'quantity' | 'unitOfMeasure'> | null;
}

export const InventoryRecordForm: FC<InventoryRecordFormProps> = ({ isOpen, setIsOpen, catalogItems, editRecord }) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { query, clear } = useSearchBox();
  const { hits } = useHits();
  const formRef = useRef<HTMLFormElement | null>(null);
  const mode = editRecord ? 'edit' : 'create';

  const catalogItemMap = useCatalogItemMap(catalogItems);
  const selectedItem = useMemo(() => {
    const id = editRecord?.catalogItemId ?? selectedItemId;
    return (id && catalogItemMap[id]) ?? null;
  }, [editRecord?.catalogItemId, selectedItemId, catalogItemMap]);

  const showList = useMemo(() => mode === 'create' && !selectedItemId, [mode, selectedItemId]);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const onSelect = useCallback(
    (id: string | null) => {
      setSelectedItemId(id);
      clear();
    },
    [clear]
  );

  const onInputFocus = useCallback(() => setSelectedItemId(null), []);

  const onAfterLeave = useCallback(() => {
    setTimeout(() => {
      setErrorMessage(null);
      setSelectedItemId(null);
      formRef.current?.reset();
      clear();
    }, 1000);
  }, [clear]);

  const convertedHits = useMemo<ListCatalogItem[]>(
    () =>
      hits.map((hit) => ({
        id: hit.objectID,
        name: hit.name as string,
        type: hit.parentId ? 'Variety of ' + catalogItemMap[hit.parentId as string].name : 'Species',
        thumbnail: hit.thumbnail as string,
      })),
    [hits, catalogItemMap]
  );

  const alphabetizedList = useCreateAlphabetizedList(query ? convertedHits : catalogItems);

  const fetcher = useFetcher<{ itemAdded?: boolean; itemError?: string }>();
  const isSubmitting = useMemo(() => fetcher.submission && fetcher.state === 'submitting', [fetcher]);

  useEffect(() => {
    setErrorMessage(null);
    if (fetcher.type === 'done' && fetcher.data?.itemAdded) {
      onClose();
    } else if (fetcher.type === 'done' && fetcher.data?.itemError) {
      setErrorMessage(fetcher.data.itemError);
    }
  }, [fetcher, onClose]);

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={onAfterLeave}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0 bg-black/20 backdrop-blur" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-primary-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">
                            {mode === 'create' ? 'Add' : 'Edit'} Inventory Record
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="rounded-md bg-primary-700 text-primary-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={onClose}
                            >
                              <span className="sr-only">Close panel</span>
                              <XIcon className="h-6 w-6" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-primary-300">
                            {mode === 'create'
                              ? 'Get started by searching for the catalog item you would like to add to your inventory.'
                              : 'Edit the selected inventory record.'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          {/* Search bar */}
                          {mode === 'create' ? (
                            <div className="pt-6 pb-5">
                              <SearchBox onFocus={onInputFocus} />

                              <p className="mt-2 text-sm text-gray-500">
                                Can't find what you're looking for?{' '}
                                <Link to="/growers/catalog/new" className="font-medium text-primary-600">
                                  Add a new catalog item
                                </Link>
                              </p>
                            </div>
                          ) : null}

                          {!showList && selectedItem ? (
                            <>
                              <div className="py-4">
                                <div className="flex items-start space-x-4">
                                  <img
                                    className="h-20 w-20 rounded"
                                    src={selectedItem.thumbnail || '/images/no-image-placeholder.svg'}
                                    alt={selectedItem.name}
                                  />
                                  <div className="space-y-2">
                                    <h3 className="text-xl font-medium text-gray-800">{selectedItem.name}</h3>
                                    <p className="text-gray-500">{selectedItem.description}</p>
                                  </div>
                                </div>
                              </div>

                              <fetcher.Form
                                ref={formRef}
                                id="add-item"
                                method={editRecord ? 'put' : 'post'}
                                className="py-4"
                              >
                                <input type="hidden" name="catalogItemId" value={selectedItem.id ?? ''} />
                                {editRecord ? (
                                  <input type="hidden" name="inventoryRecordId" value={editRecord.id} />
                                ) : null}
                                <Input
                                  autoFocus={true}
                                  type="number"
                                  name="quantity"
                                  label="Quantity"
                                  helpText="Enter the quantity that you will bring to the market."
                                  inputClassName="pr-24"
                                  defaultValue={editRecord?.quantity ?? ''}
                                  trailingDropdown={
                                    <Input.TrailingDropdown
                                      srLabel="unit"
                                      name="unitOfMeasure"
                                      defaultValue={editRecord?.unitOfMeasure ?? UnitOfMeasure.BUNCH}
                                      options={[
                                        { label: 'Bunches', value: UnitOfMeasure.BUNCH },
                                        {
                                          label: 'Stems',
                                          value: UnitOfMeasure.STEM,
                                        },
                                      ]}
                                    />
                                  }
                                />
                                {errorMessage ? <p className="mt-4 text-red-500">{errorMessage}</p> : null}
                              </fetcher.Form>
                            </>
                          ) : null}
                        </div>

                        {/* List */}
                        {showList ? <SearchResults list={alphabetizedList} onSelect={onSelect} /> : null}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <Button type="button" kind="white" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        className="ml-4"
                        type="submit"
                        form="add-item"
                        name="_action"
                        value={mode === 'create' ? 'add-item' : 'edit-item'}
                        loading={isSubmitting}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

interface SearchResultsProps {
  list: { [key: string]: { id: string; name: string; type: string; thumbnail: string | null }[] };
  onSelect: (id: string) => void;
}

const SearchResults: FC<SearchResultsProps> = React.memo(({ list, onSelect }) => {
  return (
    <div>
      {Object.keys(list).map((letter) => (
        <div key={letter} className="relative">
          <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
            <h3>{letter}</h3>
          </div>
          <ul className="relative z-0 divide-y divide-gray-200">
            {list[letter].map((catalogItem) => (
              <li key={catalogItem.id} className="bg-white">
                <div className="relative flex items-center space-x-3 px-6 py-5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary-500 hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={catalogItem.thumbnail ?? '/images/no-image-placeholder.svg'}
                      alt=""
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <button
                      type="button"
                      className="text-left focus:outline-none"
                      onClick={() => onSelect(catalogItem.id)}
                    >
                      {/* Extend touch target to entire panel */}
                      <span className="absolute inset-0" aria-hidden="true" />
                      <p className="text-sm font-medium text-gray-900">{catalogItem.name}</p>
                      <p className="truncate text-sm text-gray-500">{catalogItem.type}</p>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
});

SearchResults.displayName = 'SearchResults';

function useCreateAlphabetizedList(catalogItems: ListCatalogItem[]) {
  return useMemo(() => {
    const directory: { [key: string]: ListCatalogItem[] } = {};

    catalogItems
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .forEach((catalogItem) => {
        const firstLetter = catalogItem.name.charAt(0).toUpperCase();
        if (!directory[firstLetter]) {
          directory[firstLetter] = [];
        }
        directory[firstLetter].push(catalogItem);
      });

    return directory;
  }, [catalogItems]);
}

function useCatalogItemMap(catalogItems: InventoryRecordFormProps['catalogItems']) {
  return useMemo(() => {
    const map: { [key: string]: InventoryRecordFormProps['catalogItems'][number] } = {};

    catalogItems.forEach((catalogItem) => {
      map[catalogItem.id] = catalogItem;
    });

    return map;
  }, [catalogItems]);
}

InventoryRecordForm.displayName = 'AddInventoryItemForm';
