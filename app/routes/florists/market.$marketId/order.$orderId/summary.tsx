import { Link, useLoaderData } from '@remix-run/react';
import type { LoaderArgs } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import invariant from 'tiny-invariant';

/* This example requires Tailwind CSS v2.0+ */
const products = [
  {
    id: 1,
    name: 'Basic Tee',
    href: '#',
    price: '$36.00',
    color: 'Charcoal',
    size: 'L',
    imageSrc: 'https://tailwindui.com/img/ecommerce-images/confirmation-page-06-product-01.jpg',
    imageAlt: "Model wearing men's charcoal basic tee in large.",
  },
  // More products...
];

export async function loader({ request, params }: LoaderArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  return { marketId };
}

export default function Example() {
  const { marketId } = useLoaderData<typeof loader>();

  return (
    <>
      <main className="relative lg:min-h-full">
        <div className="h-80 overflow-hidden lg:hidden">
          <img
            src="https://res.cloudinary.com/tbf-collective/image/upload/v1658805593/prod/catalog-items/fbmc1qkjtkhiry4ps9md.jpg"
            alt="TODO"
            className="h-full w-full object-cover object-center"
          />
        </div>

        <div>
          <div className="mx-auto max-w-2xl py-16 px-4 sm:px-6 sm:py-24">
            <div className="lg:col-start-2">
              <p className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Thanks for your request
              </p>
              <p className="mt-2 text-base text-gray-500">
                We appreciate your order, and we will do our best to fulfill it. We will reach out to you as soon as we
                can.
              </p>

              <ul className="mt-6 divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
                {products.map((product) => (
                  <li key={product.id} className="flex space-x-6 py-6">
                    <img
                      src={product.imageSrc}
                      alt={product.imageAlt}
                      className="h-24 w-24 flex-none rounded-md bg-gray-100 object-cover object-center"
                    />
                    <div className="flex-auto space-y-1">
                      <h3 className="text-gray-900">
                        <a href={product.href}>{product.name}</a>
                      </h3>
                      <p>{product.color}</p>
                      <p>{product.size}</p>
                    </div>
                    <p className="flex-none font-medium text-gray-900">{product.price}</p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-6 border-t border-gray-200 pt-6 text-sm font-medium text-gray-500">
                <div className="flex items-center justify-between border-t border-gray-200 pt-6 text-gray-900">
                  <dt className="text-base">Total</dt>
                  <dd className="text-base">$86.40</dd>
                </div>
              </dl>

              <div className="mt-16 border-t border-gray-200 py-6 text-right">
                <Link
                  to={`../market/${marketId}/browse`}
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Continue Shopping<span aria-hidden="true"> &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
