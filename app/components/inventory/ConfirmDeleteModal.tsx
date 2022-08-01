import type { FC, RefObject } from 'react';
import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationIcon } from '@heroicons/react/outline';
import { Button } from '@mando-collabs/tailwind-ui';
import { useTransition } from '@remix-run/react';

export const ConfirmDeleteModal: FC<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  count: number;
  formId: string;
}> = ({ isOpen, setIsOpen, count, formId }) => {
  const { type, state } = useTransition();
  const cancelButtonRef = useRef(null);

  const isLoading = type === 'actionSubmission' && state === 'submitting';

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Delete Inventory Records
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Are you sure you want to delete {count} record(s)?</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    kind="destructive"
                    name="_action"
                    value="delete-items"
                    form={formId}
                    loading={isLoading}
                    onClick={() => setIsOpen(false)}
                    className="mb-4 w-full sm:mb-0 sm:mr-4 sm:w-auto"
                  >
                    Delete
                  </Button>
                  <Button
                    type="button"
                    kind="white"
                    onClick={() => setIsOpen(false)}
                    ref={cancelButtonRef}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
