import type { ComponentPropsWithoutRef, FC } from 'react';
import { RVFInput } from '@mando-collabs/tailwind-ui';
import { twMerge } from 'tailwind-merge';

export interface AddressFieldsProps extends ComponentPropsWithoutRef<'fieldset'> {
  namePrefix?: string;
}

export const AddressFields: FC<AddressFieldsProps> = ({ className, namePrefix, ...fieldsetProps }) => {
  const prefix = namePrefix ? `${namePrefix}.` : '';

  return (
    <fieldset className={twMerge('grid gap-4 lg:grid-cols-3', className)} {...fieldsetProps}>
      <RVFInput
        className="lg:col-span-full"
        type="text"
        name={`${prefix}street`}
        label="Street address"
        autoComplete="street-address"
      />
      <RVFInput type="text" name={`${prefix}city`} label="City" autoComplete="address-level2" />
      <RVFInput type="text" name={`${prefix}state`} label="State" autoComplete="address-level1" />
      <RVFInput type="text" name={`${prefix}zip`} label="Zip" autoComplete="postal-code" />
    </fieldset>
  );
};
