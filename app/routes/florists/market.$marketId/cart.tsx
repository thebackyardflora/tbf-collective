import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { requireFlorist } from '~/session.server';
import { PageWrapper } from '~/components/PageWrapper';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import invariant from 'tiny-invariant';
import { getCartItems } from '~/services/cart-service.server';
import { withZod } from '@remix-validated-form/with-zod';
import { validationError } from 'remix-validated-form';
import { z } from 'zod';
import { deleteOrderRequestItem } from '~/models/order-request-item.server';

const deleteItemValidator = withZod(
  z.object({
    orderRequestItemId: z.string(),
  })
);

export async function loader({ request, params }: LoaderArgs) {
  const { user } = await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  const cartItems = await getCartItems({ userId: user.id, marketEventId: marketId });

  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0).toFixed(2);

  return { marketId, cartItems, subtotal };
}

export async function action({ request, params }: ActionArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  const formData = await request.formData();

  if (formData.get('intent') === 'removeItem') {
    const validationResult = await deleteItemValidator.validate(formData);

    if (validationResult.error) {
      return validationError(validationResult.error);
    }

    const { orderRequestItemId } = validationResult.data;

    await deleteOrderRequestItem({ orderRequestItemId });
  }

  return null;
}

export default function Cart() {
  const { marketId, cartItems, subtotal } = useLoaderData<typeof loader>();
  const removeItemFetcher = useFetcher();

  return (
    <PageWrapper title="Your order">
      <div className="mt-12">
        <section aria-labelledby="cart-heading">
          <h2 id="cart-heading" className="sr-only">
            Items in your order
          </h2>

          <ul className="divide-y divide-gray-200 border-t border-b border-gray-200">
            {cartItems.map((item) => (
              <li key={item.id} className="flex py-6">
                <div className="flex-shrink-0">
                  <img
                    src={item.imageSrc ?? '/images/no-image-placeholder.svg'}
                    alt={item.imageAlt}
                    className="h-24 w-24 rounded-md object-cover object-center sm:h-32 sm:w-32"
                  />
                </div>

                <removeItemFetcher.Form method="post" className="ml-4 flex flex-1 flex-col sm:ml-6">
                  <input type="hidden" name="orderRequestItemId" value={item.id} />
                  <div>
                    <div className="flex justify-between">
                      <h4 className="text-sm">
                        <Link
                          to={`../market/${marketId}/browse/products/${item.productId}`}
                          className="font-medium text-primary-600 hover:text-primary-700"
                        >
                          {item.name}
                        </Link>
                      </h4>
                      <p className="ml-4 text-sm font-medium text-gray-900">${item.totalPrice.toFixed(2)}</p>
                    </div>
                    {item.species ? <p className="mt-1 text-sm text-gray-500">{item.species}</p> : null}
                    <p className="mt-1 text-sm text-gray-500">
                      {item.quantity} stems @ ${item.priceEach} each
                    </p>
                  </div>

                  <div className="mt-4 flex flex-1 items-end justify-end">
                    <div className="ml-4">
                      <button
                        type="submit"
                        name="intent"
                        value="removeItem"
                        className="text-sm font-medium text-primary-600 hover:text-primary-500"
                      >
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </removeItemFetcher.Form>
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
                <dd className="ml-4 text-base font-medium text-gray-900">${subtotal}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-gray-500">
              We will do our best to fulfill these order requests. As we are working with estimates, some of these items
              may not be able fully available.
            </p>
            <p className="mt-1 text-sm text-gray-500">Payment will be accepted at the wholesale floor.</p>
          </div>

          {/*<div className="mt-10">*/}
          {/*  <button*/}
          {/*    type="submit"*/}
          {/*    className="w-full rounded-md border border-transparent bg-primary-600 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-gray-50"*/}
          {/*  >*/}
          {/*    Create order request*/}
          {/*  </button>*/}
          {/*</div>*/}

          <div className="mt-6 text-center text-sm">
            <p>
              {/*or{' '}*/}
              <Link to={`../market/${marketId}/browse`} className="font-medium text-primary-600 hover:text-primary-500">
                Continue Browsing<span aria-hidden="true"> &rarr;</span>
              </Link>
            </p>
          </div>
        </section>
      </div>
    </PageWrapper>
  );
}
