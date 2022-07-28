import type { FC } from 'react';
import { Link } from '@remix-run/react';
import ImageViewer from 'react-simple-image-viewer';
import { useState } from 'react';

export interface CatalogPageProps {
  showVarieties?: boolean;
  catalogItem: {
    description: string | null;
    children?: { id: string; name: string; thumbnail: string | null }[];
    images: { id: string; thumbnail: string; original: string }[];
  };
}

export const CatalogPage: FC<CatalogPageProps> = ({ showVarieties, catalogItem }) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<number>(0);

  return (
    <div className="space-y-4 divide-y">
      {catalogItem.description ? (
        <div className="prose max-w-7xl py-4">
          <p>{catalogItem.description}</p>
        </div>
      ) : null}

      {showVarieties ? (
        <div className="py-4">
          <div className="prose">
            <h3>Varieties</h3>
          </div>
          {catalogItem.children?.length ? (
            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
              {catalogItem.children.map((variety) => (
                <div key={variety.id} className="group relative">
                  <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
                    <img
                      src={variety.thumbnail ?? '/images/no-image-placeholder.svg'}
                      alt={variety.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <h3 className="mt-4 font-semibold text-gray-900">
                    <Link to={`varieties/${variety.id}`}>
                      <span className="absolute inset-0" />
                      {variety.name}
                    </Link>
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="prose max-w-7xl">
              <div className="text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Varieties</h3>
                <p className="mt-1 text-sm text-gray-500">
                  You may add a variety to this species by clicking "New Variety"
                </p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="py-4">
        <div className="prose max-w-7xl">
          <h3 className="mb-4">Images</h3>
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
  );
};
