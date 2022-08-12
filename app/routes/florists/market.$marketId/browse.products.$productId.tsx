import { useMemo, useState } from 'react';
import { RadioGroup } from '@headlessui/react';
import classNames from 'classnames';
import { Breadcrumbs, Button, Input, RVFInput } from '@mando-collabs/tailwind-ui';
import type { ActionArgs, LoaderArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import invariant from 'tiny-invariant';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { requireFlorist } from '~/session.server';
import { UnitOfMeasure } from '~/types';
import { getCatalogItemWithInventoryInfo } from '~/models/catalog-item.server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm, validationError } from 'remix-validated-form';
import {
  createOrderRequestItem,
  OrderRequestError,
  OrderRequestErrorCodeMap,
} from '~/models/order-request-item.server';
import { CheckIcon } from '@heroicons/react/outline';

const schema = z
  .object({
    grower: z.object({
      inventoryRecordId: z.string(),
      available: zfd.numeric(z.number()),
    }),
    quantity: zfd.numeric(z.number().positive()),
    unitOfMeasure: z.nativeEnum(UnitOfMeasure),
  })
  .refine(
    (val) => {
      const stemQty = val.unitOfMeasure === UnitOfMeasure.STEM ? val.quantity : val.quantity * 10;
      return stemQty <= val.grower.available;
    },
    {
      path: ['quantity'],
      message: 'Quantity must be less than or equal to available',
    }
  );

const validator = withZod(schema);

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
  const { user } = await requireFlorist(request);

  const { marketId } = params;

  invariant(typeof marketId === 'string');

  const validationResult = await validator.validate(await request.formData());

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  const { grower, quantity, unitOfMeasure } = validationResult.data;

  const stemQty = unitOfMeasure === UnitOfMeasure.STEM ? quantity : quantity * 10;

  try {
    await createOrderRequestItem({
      quantity: stemQty,
      inventoryRecordId: grower.inventoryRecordId,
      marketEventId: marketId,
      userId: user.id,
    });
  } catch (e) {
    if (e instanceof OrderRequestError) {
      if (e.code === '1003') {
        return validationError({ fieldErrors: { quantity: OrderRequestErrorCodeMap[e.code].userMessage } });
      } else {
        return json({ formError: OrderRequestErrorCodeMap[e.code].userMessage });
      }
    } else {
      return json({ formError: OrderRequestErrorCodeMap['1001'].userMessage });
    }
  }

  return json({ success: true });
}

export default function ProductPage() {
  const { marketId, catalogItem } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  const breadcrumbs = [
    { name: 'Browse', href: `../market/${marketId}/browse` },
    { name: catalogItem.name, href: '#' },
  ];

  const [selectedInventoryRecordId, setSelectedInventoryRecord] = useState(catalogItem.growers[0].inventoryRecordId);

  const selectedGrower = useMemo(
    () => catalogItem.growers.find((g) => g.inventoryRecordId === selectedInventoryRecordId)!,
    [catalogItem.growers, selectedInventoryRecordId]
  );

  const showSuccessMessage = useMemo(() => fetcher.type === 'done' && Boolean(fetcher.data.success), [fetcher]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl py-4 px-4 sm:py-8 sm:px-6 lg:row-auto lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
        {/* Product details */}
        <div className="lg:max-w-lg">
          <Breadcrumbs breadcrumbs={breadcrumbs} />

          <div className="mt-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">{catalogItem.name}</h1>
            <p className="text-base text-gray-500">Species: {catalogItem.species}</p>
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

          <section className="mt-10" aria-labelledby="options-heading">
            <h2 id="options-heading" className="sr-only">
              Product options
            </h2>

            <ValidatedForm fetcher={fetcher} id="product-page" validator={validator} method="post">
              <input type="hidden" name="grower[available]" value={selectedGrower.available} />

              <div>
                {/* Farm selector */}
                <RadioGroup
                  name="grower[inventoryRecordId]"
                  value={selectedInventoryRecordId}
                  onChange={setSelectedInventoryRecord}
                >
                  <RadioGroup.Label className="block text-sm font-medium text-gray-700">Grower</RadioGroup.Label>
                  <div className="mt-1 grid grid-cols-1 gap-4">
                    {catalogItem.growers.map((grower) => (
                      <RadioGroup.Option
                        as="div"
                        key={grower.name}
                        value={grower.inventoryRecordId}
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
              <div className="mt-10 grid grid-cols-2 items-start gap-4">
                <RVFInput
                  inputClassName="h-[50px] pr-24"
                  name="quantity"
                  type="number"
                  pattern="\d*"
                  placeholder="0"
                  required
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
            </ValidatedForm>
            {showSuccessMessage ? (
              <p className="mt-2 flex items-center text-sm text-primary-700">
                <CheckIcon className="mr-2 h-5 w-5" />
                Item added to order!
              </p>
            ) : null}
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
      </div>
    </div>
  );
}
