/* This example requires Tailwind CSS v2.0+ */
import type { FC } from 'react';
import { Highlight, Hits } from 'react-instantsearch-hooks-web';
import type { Hit } from 'instantsearch.js';
import { useSearchBox } from 'react-instantsearch-hooks';

export interface CatalogGridProps {
  items: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  }[];
}

export const CatalogGrid: FC<CatalogGridProps> = ({ items }) => {
  const { query } = useSearchBox();

  return query ? (
    <Hits
      hitComponent={CatalogItem}
      classNames={{ list: 'mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8' }}
    />
  ) : (
    <ul className="mt-8 grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
      {items.map((item) => (
        <li key={item.id} className="col-span-1">
          <CatalogItem item={item} />
        </li>
      ))}
    </ul>
  );
};

const CatalogItem: FC<
  | {
      hit: CatalogGridProps['items'][number] & Hit;
    }
  | { item?: CatalogGridProps['items'][number] }
> = (props) => {
  let hit;
  let item;
  if ('hit' in props) {
    hit = props.hit;
  } else {
    item = props.item;
  }

  return (
    <div>
      <div className="relative">
        <div className="relative h-72 w-full overflow-hidden rounded-lg">
          {hit?.imageUrl ? (
            <img src={hit.imageUrl} alt={hit.name} className="h-full w-full object-cover object-center" />
          ) : item?.imageUrl ? (
            <img
              src={item.imageUrl ?? undefined}
              alt={item.name}
              className="h-full w-full object-cover object-center"
            />
          ) : null}
        </div>
        <div className="relative mt-4">
          <p className="mt-1 text-sm text-gray-500">
            {hit ? (
              <Highlight hit={hit} attribute="description">
                {hit.description}
              </Highlight>
            ) : (
              item?.description
            )}
          </p>
        </div>
        <div className="absolute inset-x-0 top-0 flex h-72 items-end justify-end overflow-hidden rounded-lg p-4">
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black opacity-50" />
          <p className="relative text-lg font-semibold text-white">
            {hit ? (
              <Highlight hit={hit} attribute="name">
                {hit.name}
              </Highlight>
            ) : (
              item?.name
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
