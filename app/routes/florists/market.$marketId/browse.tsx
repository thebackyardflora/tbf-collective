import type { LoaderArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { PageWrapper } from '~/components/PageWrapper';
import { Input } from '@mando-collabs/tailwind-ui';
import { SearchIcon } from '@heroicons/react/outline';
import { Link, useLoaderData } from '@remix-run/react';
import { getCatalogGroupsForBrowse } from '~/models/catalog-item.server';
import invariant from 'tiny-invariant';

export async function loader({ request, params }: LoaderArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  const species = await getCatalogGroupsForBrowse({ marketEventId: marketId });

  return json({ species });
}

export default function Browse() {
  const { species } = useLoaderData<typeof loader>();

  return (
    <PageWrapper title="Browse Inventory" description="Browse through the inventory for this upcoming market">
      <div className="mt-4">
        <Input type="search" leadingIcon={SearchIcon} name="search" />
      </div>

      {species.map((species) => (
        <div className="mt-6" key={species.name}>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{species.name}</h2>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
            {species.varieties.map((variety) => (
              <div key={variety.id} className="group relative">
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
                <p className="mt-1 text-sm text-gray-500">{variety.species}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{variety.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageWrapper>
  );
}
