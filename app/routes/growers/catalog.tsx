import { PageWrapper } from '~/components/PageWrapper';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { PlusIcon } from '@heroicons/react/outline';
import { CatalogGrid } from '~/components/CatalogGrid';
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

  const url = request.url;
  const catalogItems = await getCatalogItems();

  return json({ catalogItems, url });
}

export default function Catalog() {
  const { catalogItems, url } = useLoaderData<typeof loader>();

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
        <CatalogSearch initialCatalogItems={catalogItems} url={url} />
      </InstantSearchSSRProvider>
    </PageWrapper>
  );
}

function CatalogSearch({
  initialCatalogItems,
}: {
  initialCatalogItems: UseDataFunctionReturn<typeof loader>['catalogItems'];
  url: string;
}) {
  const searchClient = useAlgolia();

  return (
    <InstantSearch searchClient={searchClient} indexName="dev_tbf_collective">
      <SearchBox className="mt-4" />
      <CatalogGrid items={initialCatalogItems} />
    </InstantSearch>
  );
}
