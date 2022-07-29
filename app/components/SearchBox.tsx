import type { InputProps } from '@mando-collabs/tailwind-ui';
import { Input } from '@mando-collabs/tailwind-ui';
import type { FC } from 'react';
import { useSearchBox } from 'react-instantsearch-hooks';
import { SearchIcon } from '@heroicons/react/outline';
import debounce from 'lodash.debounce';
import { useRef } from 'react';

export interface SearchBoxProps
  extends Omit<InputProps, 'leadingIcon' | 'type' | 'name' | 'defaultValue' | 'onChange'> {}

export const SearchBox: FC<SearchBoxProps> = ({ className, ...inputProps }) => {
  const debounceSearch = useRef(
    debounce((query: string, search: (value: string) => void) => {
      search(query);
    }, 200)
  );
  const { query, refine } = useSearchBox({ queryHook: debounceSearch.current });

  return (
    <Input
      leadingIcon={SearchIcon}
      className={className}
      type="search"
      name="search"
      defaultValue={query}
      onChange={(e) => refine(e.target.value)}
      {...inputProps}
    />
  );
};
