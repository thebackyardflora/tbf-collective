/* This example requires Tailwind CSS v2.0+ */
import type { FC, ReactNode } from 'react';
import React, { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
import { AvatarPlaceholder } from '~/components/AvatarPlaceholder';
import Logo from '~/components/Logo';
import { Link, useFetcher } from '@remix-run/react';

export interface AppLayoutProps {
  children?: ReactNode;
  user: {
    name: string;
    email: string;
    imageUrl: string | null;
    isAdmin: boolean;
  };
  headerActions?: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children, headerActions, user }) => {
  const logoutFetcher = useFetcher();

  const handleSignOutClick = async () => {
    await logoutFetcher.submit(null, { action: '/logout', method: 'post' });
  };

  const userNavigation = [{ name: 'Your Profile', href: 'profile' }];

  if (user.isAdmin) {
    userNavigation.push({ name: 'Admin Dashboard', href: '/admin' });
  }

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="border-b border-gray-200 bg-white">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-20 justify-between">
                <div className="flex">
                  <Link to="/" className="flex flex-shrink-0 items-center">
                    <Logo className="h-10 w-auto sm:block sm:h-12" />
                  </Link>
                </div>
                <div className="hidden space-x-3 sm:ml-6 sm:flex sm:items-center">
                  {headerActions}

                  {/*<button*/}
                  {/*  type="button"*/}
                  {/*  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"*/}
                  {/*>*/}
                  {/*  <span className="sr-only">View notifications</span>*/}
                  {/*  <BellIcon className="h-6 w-6" aria-hidden="true" />*/}
                  {/*</button>*/}

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button
                        className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                        data-testid="profile-button"
                      >
                        <span className="sr-only">Open user menu</span>
                        {user.imageUrl ? (
                          <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                        ) : (
                          <div className="h-8 w-8 overflow-hidden rounded-full">
                            <AvatarPlaceholder />
                          </div>
                        )}
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {userNavigation.map((item) => (
                          <Menu.Item key={item.name}>
                            {({ active }) => (
                              <Link
                                to={item.href}
                                className={classNames(
                                  active ? 'bg-gray-100' : '',
                                  'block px-4 py-2 text-sm text-gray-700'
                                )}
                              >
                                {item.name}
                              </Link>
                            )}
                          </Menu.Item>
                        ))}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              type="button"
                              className={classNames(
                                active ? 'bg-gray-100' : '',
                                'block w-full px-4 py-2 text-left text-sm text-gray-700'
                              )}
                              onClick={handleSignOutClick}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
                <div className="-mr-2 flex items-center space-x-3 sm:hidden">
                  {headerActions}

                  {/* Mobile menu button */}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    {user.imageUrl ? (
                      <img className="h-10 w-10 rounded-full" src={user.imageUrl} alt="" />
                    ) : (
                      <div className="h-10 w-10 overflow-hidden rounded-full">
                        <AvatarPlaceholder />
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                  <button
                    type="button"
                    className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as={Link}
                      to={item.href}
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                  <Disclosure.Button
                    className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    as="button"
                    type="button"
                    onClick={handleSignOutClick}
                  >
                    Sign out
                  </Disclosure.Button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <div className="py-8">{children}</div>
    </div>
  );
};
