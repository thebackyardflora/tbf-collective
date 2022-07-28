import { PageWrapper } from '~/components/PageWrapper';
import type { LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { requireActiveCompany } from '~/session.server';
import { CompanyType } from '@prisma/client';
import invariant from 'tiny-invariant';
import { getCatalogItemById } from '~/models/catalog-item.server';
import { getImageUrl } from '~/cloudinary.server';
import { Link, useLoaderData } from '@remix-run/react';
import { Button } from '@mando-collabs/tailwind-ui';
import { useState } from 'react';
import ImageViewer from 'react-simple-image-viewer';
import { PlusIcon } from '@heroicons/react/outline';

export async function loader({ request, params }: LoaderArgs) {
  await requireActiveCompany(request, CompanyType.GROWER);

  const catalogItemId = params.id;
  invariant(catalogItemId, 'catalogItemId is required');

  const catalogItem = await getCatalogItemById(catalogItemId);

  if (!catalogItem) {
    return redirect('/growers/catalog');
  }

  return json({
    catalogItem: {
      ...catalogItem,
      images: catalogItem.images.map((image) => ({
        id: image.id,
        thumbnail: getImageUrl(image.imageKey, { width: 400, height: 400, crop: 'fill' }),
        original: getImageUrl(image.imageKey),
      })),
    },
  });
}

export default function CatalogItem() {
  const { catalogItem } = useLoaderData<typeof loader>();

  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<number>(0);

  return (
    <PageWrapper
      title={catalogItem.name}
      breadcrumbs={[
        { name: 'Catalog', href: '../catalog' },
        { name: `Species: ${catalogItem.name}`, href: '#' },
      ]}
      actions={
        <>
          <Link to="varieties/new" className="mr-2">
            <Button type="button" kind="secondary">
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Variety
            </Button>
          </Link>
          <Link to="edit">
            <Button>Edit</Button>
          </Link>
        </>
      }
    >
      <div className="space-y-4 divide-y">
        <div className="prose max-w-7xl py-4">
          <h3>Description</h3>
          <p>{catalogItem.description}</p>
        </div>

        <div className="prose max-w-7xl py-4">
          <h3>Varieties</h3>
          <div className="prose max-w-7xl">
            <div className="text-center">
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Varieties</h3>
              <p className="mt-1 text-sm text-gray-500">
                You may add a variety to this species by clicking "New Variety"
              </p>
            </div>
          </div>
        </div>

        <div className="py-4">
          <div className="prose max-w-7xl">
            <h3>Images</h3>
            {catalogItem.images.length === 0 ? (
              <div className="text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Images</h3>
                <p className="mt-1 text-sm text-gray-500">You may add images to this species by clicking "Edit"</p>
              </div>
            ) : null}
          </div>

          {catalogItem.images.length ? (
            <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
              {catalogItem.images.map((image, index) => (
                <li key={image.id} className="relative">
                  <div className="group aspect-w-10 aspect-h-7 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                    <img
                      src={image.thumbnail}
                      alt=""
                      className="pointer-events-none object-cover group-hover:opacity-75"
                    />
                    <button
                      type="button"
                      className="absolute inset-0 focus:outline-none"
                      onClick={() => {
                        setCurrentImage(index);
                        setIsViewerOpen(true);
                      }}
                    >
                      <span className="sr-only">View details</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {isViewerOpen && (
          <ImageViewer
            src={catalogItem.images.map((image) => image.original)}
            currentIndex={currentImage}
            disableScroll={false}
            closeOnClickOutside={true}
            onClose={() => setIsViewerOpen(false)}
          />
        )}
      </div>
    </PageWrapper>
  );
}
