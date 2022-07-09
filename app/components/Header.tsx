/* This example requires Tailwind CSS v2.0+ */
import type { ElementType } from 'react';
import { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { MenuIcon, XIcon } from '@heroicons/react/outline';
import { Form, Link, useLocation } from '@remix-run/react';
import classNames from 'classnames';
import Logo from '~/components/Logo';
import { ChevronDownIcon } from '@heroicons/react/solid';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import type { User, Application } from '@prisma/client';
import { Button } from '@mando-collabs/tailwind-ui';
import { ApplicationStatus, ApplicationType } from '@prisma/client';

export type HeaderProps = {
  user: User | null;
  application?: Application | null;
  hideLogoOnMobile?: boolean;
};

export default function Header(props: HeaderProps) {
  const { pathname } = useLocation();

  const navigation: {
    title: string;
    href: string;
    active: boolean;
    Icon: ElementType<{ className?: string }>;
    description: string;
  }[] = [
    {
      title: 'Our growers',
      href: '/growers',
      active: pathname.startsWith('/growers'),
      Icon: AgricultureIcon,
      description: 'Local farms that supply flowers',
    },
    {
      title: 'Our florists',
      href: '/florists',
      active: pathname.startsWith('/florists'),
      Icon: LocalFloristIcon,
      description: 'Floral design professionals',
    },
  ];

  return (
    <Popover className="relative bg-white">
      {({ close: closeMain }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-between border-b-2 border-gray-100 py-6 md:justify-start md:space-x-10">
              <div className="flex justify-start lg:w-0 lg:flex-1">
                <Link to="/" onClick={() => closeMain()}>
                  <span className="sr-only">The Backyard Flora</span>
                  <Logo
                    className={classNames(props.hideLogoOnMobile ? 'hidden' : '', 'h-10 w-auto sm:block sm:h-12')}
                  />
                  {/*<span className="text-xl font-medium">The Backyard Flora</span>*/}
                </Link>
              </div>
              <div className="-my-2 -mr-2 md:hidden">
                <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open menu</span>
                  <MenuIcon className="h-6 w-6" aria-hidden="true" />
                </Popover.Button>
              </div>
              <Popover.Group as="nav" className="hidden space-x-10 md:flex">
                <Link
                  to="/"
                  className={classNames(
                    'text-base font-medium text-gray-500 hover:text-gray-900',
                    pathname === '/' ? 'font-bold text-gray-800' : null
                  )}
                  onClick={() => closeMain()}
                >
                  Home
                </Link>

                <Popover className="relative">
                  {({ open, close }) => (
                    <>
                      <Popover.Button
                        className={classNames(
                          open ? 'text-gray-900' : 'text-gray-500',
                          'group inline-flex items-center rounded-md bg-white text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                        )}
                      >
                        <span>Collective</span>
                        <ChevronDownIcon
                          className={classNames(
                            open ? 'text-gray-600' : 'text-gray-400',
                            'ml-2 h-5 w-5 group-hover:text-gray-500'
                          )}
                          aria-hidden="true"
                        />
                      </Popover.Button>

                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute left-1/2 z-10 mt-3 w-screen max-w-md -translate-x-1/2 px-2 sm:px-0">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative grid gap-6 bg-white py-6 px-5 sm:gap-8 sm:p-8">
                              {navigation.map((item) => (
                                <Link
                                  key={item.title}
                                  to={item.href}
                                  className="-m-3 flex items-start rounded-lg p-3 hover:bg-gray-50"
                                  onClick={() => close()}
                                >
                                  <item.Icon className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
                                  <div className="ml-4">
                                    <p className="text-base font-medium text-gray-900">{item.title}</p>
                                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
              </Popover.Group>
              <div className="hidden items-center justify-end md:flex md:flex-1 lg:w-0">
                {!props.user ? (
                  <Form action="/login">
                    <button
                      type="submit"
                      className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
                    >
                      Sign in
                    </button>
                    <button
                      type="submit"
                      className="ml-8 inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-primary-600 py-2 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                    >
                      Sign up
                    </button>
                  </Form>
                ) : (
                  <div className="flex space-x-2">
                    <Form method="post" action="/logout">
                      <Button type="submit" kind="white">
                        Logout
                      </Button>
                    </Form>

                    {props.application?.status === ApplicationStatus.APPROVED ? (
                      <Link to={props.application.type === ApplicationType.GROWER ? '/growers/dashboard' : '#'}>
                        <Button>Dashboard</Button>
                      </Link>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Transition
            as={Fragment}
            enter="duration-200 ease-out"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="duration-100 ease-in"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Popover.Panel focus className="absolute inset-x-0 top-0 z-50 origin-top-right p-2 transition md:hidden">
              <div className="divide-y-2 divide-gray-50 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="px-5 pt-5 pb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Logo className="h-10 w-auto" />
                      {/*<span className="text-xl font-medium">The Backyard Flora</span>*/}
                    </div>
                    <div className="-mr-2">
                      <Popover.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                        <span className="sr-only">Close menu</span>
                        <XIcon className="h-6 w-6" aria-hidden="true" />
                      </Popover.Button>
                    </div>
                  </div>

                  <div className="mt-6 font-medium text-gray-500">The Flower Collective</div>
                  <div className="mt-6">
                    <nav className="grid gap-y-8">
                      {navigation.map((item) => (
                        <Link
                          key={item.title}
                          to={item.href}
                          className="-m-3 flex items-center rounded-md p-3 hover:bg-gray-50"
                          onClick={() => closeMain()}
                        >
                          <item.Icon className="h-6 w-6 shrink-0 text-primary-600" aria-hidden="true" />
                          <span className="ml-3 text-base font-medium text-gray-900">{item.title}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>
                </div>
                <div className="space-y-6 py-6 px-5">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <Link
                      to="/"
                      className={'text-base font-medium text-gray-900 hover:text-gray-700'}
                      onClick={() => closeMain()}
                    >
                      Home
                    </Link>
                    <Link
                      to="/privacy"
                      className={'text-base font-medium text-gray-900 hover:text-gray-700'}
                      onClick={() => closeMain()}
                    >
                      Privacy
                    </Link>
                  </div>
                  {!props.user ? (
                    <Form action="/login">
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700"
                      >
                        Sign up
                      </button>
                      <p className="mt-6 text-center text-base font-medium text-gray-500">
                        <button type="submit" className="text-primary-600 hover:text-primary-500">
                          Sign in
                        </button>
                      </p>
                    </Form>
                  ) : (
                    <div className="flex justify-end space-x-2">
                      <Form method="post" action="/logout">
                        <Button type="submit" kind="white">
                          Logout
                        </Button>
                      </Form>
                      {props.application?.status === ApplicationStatus.APPROVED ? (
                        <Link to={props.application.type === ApplicationType.GROWER ? '/growers/dashboard' : '#'}>
                          <Button>Dashboard</Button>
                        </Link>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}
