import { PageWrapper } from '~/components/PageWrapper';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { PlusIcon } from '@heroicons/react/24/outline';
import { CatalogGrid } from '~/components/catalog/CatalogGrid';
import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { getTopLevelCategoryItems } from '~/models/catalog-item.server';
import { InstantSearch, InstantSearchSSRProvider } from 'react-instantsearch-hooks-web';
import { SearchBox } from '~/components/SearchBox';
import invariant from 'tiny-invariant';
import { useAlgolia } from '~/components/AlgoliaProvider';
import { requireAdmin } from '~/session.server';
import type { SerializeFrom } from '@remix-run/server-runtime';

export async function loader({ request }: LoaderArgs) {
  await requireAdmin(request);

  invariant(process.env.ALGOLIA_APP_ID, 'ALGOLIA_APP_ID is required');
  invariant(process.env.ALGOLIA_API_KEY, 'ALGOLIA_API_KEY is required');
  invariant(process.env.ALGOLIA_INDEX_NAME, 'ALGOLIA_INDEX_NAME is required');

  const catalogItems = await getTopLevelCategoryItems();

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
  initialCatalogItems: SerializeFrom<typeof loader>['catalogItems'];
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
