import type { LoaderArgs } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { PageWrapper } from '~/components/PageWrapper';
import { Input } from '@mando-collabs/tailwind-ui';
import { SearchIcon } from '@heroicons/react/outline';
import { Link } from '@remix-run/react';

const species = [
  {
    name: 'Dahlia',
    varieties: [
      {
        id: 1,
        name: 'Crazy hair day',
        color: 'Snapdragon',
        price: '$2.50 - $3.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1659197420/prod/catalog-items/gl6cbhhj2r5td1whzrug.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 2,
        name: 'Cafe au Lait',
        color: 'Dahlia',
        price: '$2.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658805590/prod/catalog-items/cbjzttwzssgm6qcqcb0f.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 3,
        name: 'The big yellow one',
        color: 'Sunflower',
        price: '$5.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658807569/prod/catalog-items/npnvmsxtdsg80kj3mp0d.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 4,
        name: 'The pretty kind',
        color: 'Dahlia',
        price: '$5.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658805592/prod/catalog-items/tuqwfd5lgqob7ke4fad8.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
    ],
  },
  {
    name: 'Snapdragons',
    varieties: [
      {
        id: 1,
        name: 'Crazy hair day',
        color: 'Snapdragon',
        price: '$2.50 - $3.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1659197420/prod/catalog-items/gl6cbhhj2r5td1whzrug.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 4,
        name: 'The pretty kind',
        color: 'Dahlia',
        price: '$5.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658805592/prod/catalog-items/tuqwfd5lgqob7ke4fad8.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 2,
        name: 'Cafe au Lait',
        color: 'Dahlia',
        price: '$2.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658805590/prod/catalog-items/cbjzttwzssgm6qcqcb0f.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
      {
        id: 3,
        name: 'The big yellow one',
        color: 'Sunflower',
        price: '$5.00 / stem',
        href: '#',
        imageSrc:
          'https://res.cloudinary.com/tbf-collective/image/upload/v1658807569/prod/catalog-items/npnvmsxtdsg80kj3mp0d.jpg',
        imageAlt: 'Hand stitched, orange leather long wallet.',
      },
    ],
  },
];

export async function loader({ request }: LoaderArgs) {
  await requireFlorist(request);

  return null;
}

export default function Browse() {
  return (
    <PageWrapper title="Browse Inventory" description="Browse through the inventory for this upcoming market">
      <div className="mt-4">
        <Input type="search" leadingIcon={SearchIcon} name="search" />
      </div>

      {species.map((species) => (
        <div className="mt-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">{species.name}</h2>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-0 lg:gap-x-8">
            {species.varieties.map((variety) => (
              <div key={variety.id} className="group relative">
                <div className="h-56 w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 lg:h-72 xl:h-80">
                  <img
                    src={variety.imageSrc}
                    alt={variety.imageAlt}
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <h3 className="mt-4 text-sm text-gray-700">
                  <Link to={`products/${variety.id}`}>
                    <span className="absolute inset-0" />
                    {variety.name}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{variety.color}</p>
                <p className="mt-1 text-sm font-medium text-gray-900">{variety.price}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </PageWrapper>
  );
}
