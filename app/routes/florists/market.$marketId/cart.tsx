import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { PageWrapper } from '~/components/PageWrapper';
import { Form, Link, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { UnitOfMeasure } from '~/types';

const products = [
  {
    id: 1,
    href: '#',
    name: 'Snapdragons',
    quantity: 2,
    priceEa: '$5.00',
    unit: UnitOfMeasure.BUNCH,
    farm: 'The Backyard Flora',
    totalPrice: '$10.00',
    variety: 'Pretty pink',
    imageSrc:
      'https://res.cloudinary.com/tbf-collective/image/upload/v1659197420/prod/catalog-items/gl6cbhhj2r5td1whzrug.jpg',
    imageAlt: 'Insulated bottle with white base and black snap lid.',
  },
  {
    id: 2,
    href: '#',
    name: 'Dahlias',
    quantity: 5,
    priceEa: '$5.00',
    unit: UnitOfMeasure.STEM,
    farm: 'Florage',
    totalPrice: '$25.00',
    variety: 'Cafe au lait',
    imageSrc:
      'https://res.cloudinary.com/tbf-collective/image/upload/v1658805590/prod/catalog-items/cbjzttwzssgm6qcqcb0f.jpg',
    imageAlt: "Front of men's Basic Tee in sienna.",
  },
];

export async function loader({ request, params }: LoaderArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  return { marketId };
}

export async function action({ request, params }: ActionArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  const orderId = 1;

  return redirect(`/florists/market/${marketId}/order/${orderId}/summary`);
}

export default function Cart() {
  const { marketId } = useLoaderData<typeof loader>();

  return (
    <PageWrapper title="Shopping Cart">
      <Form method="post" className="mt-12">
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="sr-only">
            Items in your shopping cart
          </h2>

          <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {products.map((product) => (
              <li key={product.id} className="flex py-6">
                <div className="flex-shrink-0">
                  <img
                    src={product.imageSrc}
                    alt={product.imageAlt}
                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                  />
                </div>

                <div className="ml-4 flex flex-1 flex-col sm:ml-6">
                  <div>
                    <div className="flex justify-between">
                      <h4 className="text-sm">
                        <Link to={product.href} className="font-medium text-gray-700 hover:text-gray-800">
                          {product.name}
                        </Link>
                      </h4>
                      <p className="ml-4 text-sm font-medium text-gray-900">{product.totalPrice}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{product.variety}</p>
                    <p className="mt-1 text-sm text-gray-500">{product.farm}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {product.quantity} {product.unit.toLowerCase()} @ {product.priceEa}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-1 items-end justify-end">
                    <div className="ml-4">
                      <button type="button" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Order summary */}
        <section aria-labelledby="summary-heading" className="mt-10">
          <h2 id="summary-heading" className="sr-only">
            Order summary
          </h2>

          <div>
            <dl className="space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Subtotal</dt>
                <dd className="ml-4 text-base font-medium text-gray-900">$96.00</dd>
              </div>
            </dl>
            <p className="mt-1 text-sm text-gray-500">
              We will do our best to fulfill these order requests. As we are working with estimates, some of these items
              may not be able fully available.
            </p>
            <p className="mt-1 text-sm text-gray-500">Payment will be accepted at the wholesale floor.</p>
          </div>

          <div className="mt-10">
            <button
              type="submit"
              className="w-full rounded-md border border-transparent bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"
            >
              Create order request
            </button>
          </div>

          <div className="mt-6 text-center text-sm">
            <p>
              or{' '}
              <Link to={`../market/${marketId}/browse`} className="font-medium text-primary-600 hover:text-primary-500">
                Continue Browsing<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </Form>
    </PageWrapper>
  );
}
