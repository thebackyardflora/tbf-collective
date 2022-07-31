import React from 'react';
import Logo from '~/components/Logo';
import { Link } from '@remix-run/react';
import classNames from 'classnames';
import Avatar from 'boring-avatars';

export interface StaticSidebarProps {
  navigation: { name: string; href: string; current?: boolean; icon: React.ComponentType<{ className?: string }> }[];
  user: {
    name: string;
  };
}

export const StaticSidebar: React.FC<StaticSidebarProps> = ({ navigation, user }) => {
  return (
    <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
        <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
          <div className="flex flex-shrink-0 items-center px-4">
            <Logo className="h-10 w-auto sm:block sm:h-12" />
          </div>
          <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={classNames(
                  item.current
                    ? 'bg-primary-50 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                )}
              >
                <item.icon
                  className={classNames(
                    item.current ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-6 w-6 flex-shrink-0'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
          <Link to="profile" className="group block w-full flex-shrink-0">
            <div className="flex items-center">
              <div>
                <div className="inline-block h-9 w-9 rounded-full">
                  <Avatar
                    size={36}
                    name={user.name}
                    variant="marble"
                    colors={['#78866B', '#8f9779', '#ffe8d6', '#cb997e', '#b98b73']}
                  />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{user.name}</p>
                <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">View profile</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
