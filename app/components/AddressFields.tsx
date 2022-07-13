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
      <RVFInput className="lg:col-span-full" type="text" name={`${prefix}street1`} label="Address line 1" />
      <RVFInput className="lg:col-span-full" type="text" name={`${prefix}street2`} label="Address line 2" />
      <RVFInput type="text" name={`${prefix}city`} label="City" />
      <RVFInput type="text" name={`${prefix}state`} label="State" />
      <RVFInput type="text" name={`${prefix}zip`} label="Zip" />
    </fieldset>
  );
};
