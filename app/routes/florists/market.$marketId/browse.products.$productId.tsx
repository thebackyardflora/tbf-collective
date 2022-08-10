import { useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import { Breadcrumbs, Button, Input } from '@mando-collabs/tailwind-ui';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { Form, useLoaderData } from '@remix-run/react';
import { requireFlorist } from '~/session.server';
import { UnitOfMeasure } from '~/types';
import { getCatalogItemWithInventoryInfo } from '~/models/catalog-item.server';

export async function loader({ request, params }: LoaderArgs) {
  await requireFlorist(request);

  const { marketId, productId } = params;

  invariant(typeof marketId === 'string');
  invariant(typeof productId === 'string');

  const catalogItem = await getCatalogItemWithInventoryInfo({ catalogItemId: productId, marketEventId: marketId });

  if (!catalogItem) {
    return redirect(`/florists/market/${marketId}/browse`);
  }

  return json({
    marketId,
    catalogItem,
  });
}

export async function action({ request, params }: ActionArgs) {
  await requireFlorist(request);

  const { marketId } = params;

  return redirect(`/florists/market/${marketId}/cart`);
}

export default function ProductPage() {
  const { marketId, catalogItem } = useLoaderData<typeof loader>();

  const breadcrumbs = [
    { name: 'Browse', href: `../market/${marketId}/browse` },
    { name: catalogItem.name, href: '#' },
  ];

  const [selectedGrower, setSelectedGrower] = useState(catalogItem.growers[0]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl py-4 px-4 sm:py-24 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        {/* Product details */}
        <div className="lg:max-w-lg lg:self-end">
          <Breadcrumbs breadcrumbs={breadcrumbs} />

          <div className="mt-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{catalogItem.name}</h1>
          </div>

          <section aria-labelledby="information-heading" className="mt-4">
            <h2 id="information-heading" className="sr-only">
              Product information
            </h2>

            <div className="flex items-center">
              <p className="text-lg text-gray-900 sm:text-xl">{catalogItem.price}</p>
            </div>

            <div className="mt-4 space-y-6">
              <p className="text-base text-gray-500">{catalogItem.description}</p>
            </div>
          </section>
        </div>

        {/* Product image */}
        <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
          <div className="aspect-w-1 aspect-h-1 overflow-hidden rounded-lg">
            <img
              src={catalogItem.imageSrc ?? '/images/no-image-placeholder.svg'}
              alt={catalogItem.imageAlt}
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Product form */}
        <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
          <section aria-labelledby="options-heading">
            <h2 id="options-heading" className="sr-only">
              Product options
            </h2>

            <Form method="post">
              <div>
                {/* Farm selector */}
                <RadioGroup value={selectedGrower} onChange={setSelectedGrower}>
                  <RadioGroup.Label className="block text-sm font-medium text-gray-700">Grower</RadioGroup.Label>
                  <div className="mt-1 grid grid-cols-1 gap-4">
                    {catalogItem.growers.map((grower) => (
                      <RadioGroup.Option
                        as="div"
                        key={grower.name}
                        value={grower}
                        className={({ active }) =>
                          classNames(
                            active ? 'ring-2 ring-primary-500' : '',
                            'relative block cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none'
                          )
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <RadioGroup.Label
                              as="p"
                              className="flex justify-between text-base font-medium text-gray-900"
                            >
                              <span className="truncate">{grower.name}</span>
                              <span className="flex-shrink-0">{grower.priceEach}</span>
                            </RadioGroup.Label>
                            <RadioGroup.Description as="p" className="mt-1 flex justify-end text-sm text-gray-500">
                              <span className="ml-2 shrink-0">{grower.available} stems available</span>
                            </RadioGroup.Description>
                            <div
                              className={classNames(
                                active ? 'border' : 'border-2',
                                checked ? 'border-primary-500' : 'border-transparent',
                                'pointer-events-none absolute -inset-px rounded-lg'
                              )}
                              aria-hidden="true"
                            />
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
                <p className="mt-2 text-sm font-medium text-gray-500">1 Bunch = 10 stems</p>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4">
                <Input
                  inputClassName="h-[50px] pr-24"
                  name="quantity"
                  type="number"
                  pattern="\d*"
                  placeholder="0"
                  trailingDropdown={
                    <Input.TrailingDropdown
                      srLabel="Quantity"
                      name="unitOfMeasure"
                      options={[
                        {
                          value: UnitOfMeasure.STEM,
                          label: 'Stems',
                        },
                        { value: UnitOfMeasure.BUNCH, label: 'Bunches' },
                      ]}
                    />
                  }
                />
                <Button type="submit" kind="primary" size="xl">
                  Add to cart
                </Button>
              </div>
            </Form>
          </section>
        </div>
      </div>
    </div>
  );
}
