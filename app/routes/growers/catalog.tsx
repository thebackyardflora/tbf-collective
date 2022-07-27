import { PageWrapper } from '~/components/PageWrapper';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { PlusIcon } from '@heroicons/react/outline';
import { CatalogGrid } from '~/components/catalog/CatalogGrid';
import type { LoaderArgs } from '@remix-run/node';
import { getCatalogItems } from '~/models/catalog-item.server';
import { json } from '@remix-run/node';
import { InstantSearch, InstantSearchSSRProvider } from 'react-instantsearch-hooks-web';
import type { UseDataFunctionReturn } from '@remix-run/react/dist/components';
import { SearchBox } from '~/components/SearchBox';
import invariant from 'tiny-invariant';
import { useAlgolia } from '~/components/AlgoliaProvider';

export async function loader({ request }: LoaderArgs) {
  invariant(process.env.ALGOLIA_APP_ID, 'ALGOLIA_APP_ID is required');
  invariant(process.env.ALGOLIA_API_KEY, 'ALGOLIA_API_KEY is required');
  invariant(process.env.ALGOLIA_INDEX_NAME, 'ALGOLIA_INDEX_NAME is required');

  const catalogItems = await getCatalogItems();

  return json({
    catalogItems,
    indexName: process.env.ALGOLIA_INDEX_NAME,
  });
}

export default function Catalog() {
  const { catalogItems, indexName } = useLoaderData<typeof loader>();

  return (
    <PageWrapper
      title="Catalog"
      actions={
        <div className="flex items-center space-x-4">
          <Link to="new">
            <Button kind="white" leadingIcon={PlusIcon}>
              New Item
            </Button>
          </Link>
        </div>
      }
    >
      <InstantSearchSSRProvider>
        <CatalogSearch initialCatalogItems={catalogItems} indexName={indexName} />
      </InstantSearchSSRProvider>
    </PageWrapper>
  );
}

function CatalogSearch({
  initialCatalogItems,
  indexName,
}: {
  initialCatalogItems: UseDataFunctionReturn<typeof loader>['catalogItems'];
  indexName: string;
}) {
  const searchClient = useAlgolia();

  return (
    <InstantSearch searchClient={searchClient} indexName={indexName}>
      <SearchBox className="mt-4" />
      <CatalogGrid items={initialCatalogItems} />
    </InstantSearch>
  );
}
