import type { FC } from 'react';
import { useState } from 'react';
import type { z } from 'zod';
import type { marketEventSchema } from '~/forms/market-event';
import { marketEventValidator } from '~/forms/market-event';
import type { OptionLike } from '@mando-collabs/tailwind-ui';
import { RVFButton, RVFInput, RVFSelectNative, RVFTextArea } from '@mando-collabs/tailwind-ui';
import { AddressFields } from '~/components/AddressFields';
import { ValidatedForm } from 'remix-validated-form';

export interface MarketEventFormProps {
  defaultValues?: Partial<z.infer<typeof marketEventSchema>>;
  addressOptions: OptionLike[];
  buttonText: string;
}

export const MarketEventForm: FC<MarketEventFormProps> = ({ defaultValues, addressOptions, buttonText }) => {
  const [addressId, setAddressId] = useState<string | undefined>(defaultValues?.addressId);

  return (
    <ValidatedForm
      id="market-event-form"
      method="post"
      validator={marketEventValidator}
      defaultValues={defaultValues}
      className="mt-4"
    >
      <fieldset>
        <input type="hidden" name="timezone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />
        <RVFInput type="datetime-local" label="Market date" name="marketDate" />
        <RVFSelectNative
          className="mt-4"
          value={addressId}
          onChange={(e) => {
            console.log('change', e);
            setAddressId(e.target.value);
          }}
          label="Address"
          options={addressOptions}
          placeholder="Create new"
          name="addressId"
        />
        {!addressId ? <AddressFields className="mt-4" namePrefix="address" /> : null}
        <RVFTextArea className="mt-4" label="Notes" name="notes" />
      </fieldset>

      <RVFButton className="mt-4 mr-2">{buttonText}</RVFButton>
    </ValidatedForm>
  );
};
