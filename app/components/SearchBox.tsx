import { Input } from '@mando-collabs/tailwind-ui';
import type { FC } from 'react';
import { useSearchBox } from 'react-instantsearch-hooks';
import { SearchIcon } from '@heroicons/react/outline';

function queryHook(query: string, search: (value: string) => void) {
  search(query);
}

export const SearchBox: FC<{ className?: string }> = ({ className }) => {
  const { query, refine } = useSearchBox({ queryHook });

  return (
    <Input
      leadingIcon={SearchIcon}
      className={className}
      type="search"
      name="search"
      defaultValue={query}
      onChange={(e) => refine(e.target.value)}
    />
  );
};
