import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { PageWrapper } from '~/components/PageWrapper';
import { Link, useLoaderData } from '@remix-run/react';
import { getCatalogGroupsForBrowse } from '~/models/catalog-item.server';
import invariant from 'tiny-invariant';
import type { FC } from 'react';
import { useAlgolia } from '~/components/AlgoliaProvider';
import { Hits, InstantSearch, InstantSearchSSRProvider } from 'react-instantsearch-hooks-web';
import { marketInventoryIndexName } from '~/algolia.server';
import { SearchBox } from '~/components/SearchBox';
import { useSearchBox } from 'react-instantsearch-hooks';

export async function loader({ request, params }: LoaderArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  const species = await getCatalogGroupsForBrowse({ marketEventId: marketId });

  return json({ species, searchIndex: marketInventoryIndexName });
}

export default function Browse() {
  return (
    <PageWrapper title="Browse Inventory" description="Browse through the inventory for this upcoming market">
      <InstantSearchSSRProvider>
        <BrowseSearch />
      </InstantSearchSSRProvider>
    </PageWrapper>
  );
}

const BrowseSearch: FC = () => {
  const { searchIndex } = useLoaderData<typeof loader>();

  const searchClient = useAlgolia();

  return (
    <InstantSearch indexName={searchIndex} searchClient={searchClient}>
      <div className="mt-4">
        <SearchBox />
        <SearchResults />
      </div>
    </InstantSearch>
  );
};

const SearchResults: FC = () => {
  const { species } = useLoaderData<typeof loader>();

  const { query } = useSearchBox();

  return (
    <>
      {query ? (
        <div className="mt-6">
          <Hits
            classNames={{ list: 'mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8' }}
            hitComponent={HitTile}
          />
        </div>
      ) : (
        species.map((species) => (
          <div className="mt-6" key={species.name}>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{species.name}</h2>

            <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 lg:gap-x-8">
              {species.varieties.map((variety) => (
                <CatalogItemTile key={variety.id} variety={variety} />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const HitTile: FC<{
  hit: {
    objectID: string;
    thumbnail: string | null;
    name: string;
    price?: string;
    species?: string;
  };
}> = ({ hit }) => {
  return (
    <CatalogItemTile
      variety={{
        id: hit.objectID,
        name: hit.name,
        species: hit.species ?? null,
        price: hit.price ?? null,
        imageSrc: hit.thumbnail ?? null,
      }}
    />
  );
};

const CatalogItemTile: FC<{
  variety: {
    id: string;
    imageSrc: string | null;
    name: string;
    species: string | null;
    price: string | null;
  };
}> = ({ variety }) => {
  return (
    <div className="group relative">
      <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
        <img
          src={variety.imageSrc ?? '/images/no-image-placeholder.svg'}
          alt={variety.name}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <h3 className="mt-4 text-sm text-gray-700">
        <Link to={`products/${variety.id}`}>
          <span className="absolute inset-0" />
          {variety.name}
        </Link>
      </h3>
      {variety.species ? <p className="mt-1 text-sm text-gray-500">{variety.species}</p> : null}
      {variety.price ? <p className="mt-1 text-sm font-medium text-gray-900">{variety.price}</p> : null}
    </div>
  );
};
