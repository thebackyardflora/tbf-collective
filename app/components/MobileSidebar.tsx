import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import Logo from '~/components/Logo';
import { Link } from '@remix-run/react';
import classNames from 'classnames';
import type { User } from '@prisma/client';
import Avatar from 'boring-avatars';

export interface MobileSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  navigation: { name: string; href: string; current?: boolean; icon: React.ComponentType<{ className?: string }> }[];
  user: User;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ sidebarOpen, setSidebarOpen, navigation, user }) => {
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-4">
                  <Logo className={'h-10 w-auto sm:block sm:h-12'} />
                </div>
                <nav className="mt-5 space-y-1 px-2">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        item.current
                          ? 'bg-primary-50 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon
                        className={classNames(
                          item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                          'mr-4 h-6 w-6 flex-shrink-0'
                        )}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
                <Link to="#" className="group block flex-shrink-0">
                  <div className="flex items-center">
                    <div className="inline-block h-10 w-10 overflow-hidden rounded-full">
                      <Avatar
                        size={40}
                        name={user.name}
                        variant="marble"
                        colors={['#78866B', '#8f9779', '#ffe8d6', '#cb997e', '#b98b73']}
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">{user.name}</p>
                      <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">View profile</p>
                    </div>
                  </div>
                </Link>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="w-14 flex-shrink-0">{/* Force sidebar to shrink to fit close icon */}</div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
