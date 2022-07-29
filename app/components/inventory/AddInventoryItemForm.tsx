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
import { Fragment, useMemo, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { SearchIcon, XIcon } from '@heroicons/react/outline';
import { Input } from '@mando-collabs/tailwind-ui';

export interface AddInventoryItemFormProps {
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
}

export const AddInventoryItemForm: FC<AddInventoryItemFormProps> = ({ isOpen, setIsOpen, catalogItems }) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const alphabetizedList = useCreateAlphabetizedList(catalogItems);
  const catalogItemMap = useCatalogItemMap(catalogItems);
  const selectedItem = useMemo(
    () => selectedItemId && catalogItemMap[selectedItemId],
    [selectedItemId, catalogItemMap]
  );

  const showList = useMemo(() => !selectedItemId || isInputFocused, [selectedItemId, isInputFocused]);

  const onClose = () => {
    setIsOpen(false);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment} afterLeave={() => setSelectedItemId(null)}>
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
                  <form className="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                    <div className="h-0 flex-1 overflow-y-auto">
                      <div className="bg-primary-700 py-6 px-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white"> Add Inventory Record </Dialog.Title>
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
                            Get started by searching for the catalog item you would like to add to your inventory.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col justify-between">
                        <div className="divide-y divide-gray-200 px-4 sm:px-6">
                          {/* Search bar */}
                          <div className="space-y-6 pt-6 pb-5">
                            <Input
                              type="search"
                              name="search"
                              label="Search catalog"
                              leadingIcon={SearchIcon}
                              trailingButton={<Input.TrailingButton>Search</Input.TrailingButton>}
                              onFocus={() => setIsInputFocused(true)}
                              onBlur={() => setIsInputFocused(false)}
                            />
                          </div>

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

                              <div className="py-4">
                                <Input
                                  type="number"
                                  name="quantity"
                                  label="Quantity"
                                  helpText="Enter the quantity that you will bring to the market."
                                />
                              </div>
                            </>
                          ) : null}
                        </div>

                        {/* List */}
                        {showList ? (
                          <div>
                            {Object.keys(alphabetizedList).map((letter) => (
                              <div key={letter} className="relative">
                                <div className="sticky top-0 z-10 border-t border-b border-gray-200 bg-gray-50 px-6 py-1 text-sm font-medium text-gray-500">
                                  <h3>{letter}</h3>
                                </div>
                                <ul role="list" className="relative z-0 divide-y divide-gray-200">
                                  {alphabetizedList[letter].map((catalogItem) => (
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
                                            onClick={() => setSelectedItemId(catalogItem.id)}
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
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-shrink-0 justify-end px-4 py-4">
                      <button
                        type="button"
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="ml-4 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

function useCreateAlphabetizedList(catalogItems: AddInventoryItemFormProps['catalogItems']) {
  return useMemo(() => {
    const directory: { [key: string]: AddInventoryItemFormProps['catalogItems'] } = {};

    catalogItems.forEach((catalogItem) => {
      const firstLetter = catalogItem.name.charAt(0).toUpperCase();
      if (!directory[firstLetter]) {
        directory[firstLetter] = [];
      }
      directory[firstLetter].push(catalogItem);
    });

    return directory;
  }, [catalogItems]);
}

function useCatalogItemMap(catalogItems: AddInventoryItemFormProps['catalogItems']) {
  return useMemo(() => {
    const map: { [key: string]: AddInventoryItemFormProps['catalogItems'][number] } = {};

    catalogItems.forEach((catalogItem) => {
      map[catalogItem.id] = catalogItem;
    });

    return map;
  }, [catalogItems]);
}

AddInventoryItemForm.displayName = 'AddInventoryItemForm';
