import { PageWrapper } from '~/components/PageWrapper';
import { RVFButton, RVFInput, RVFSelectNative, RVFTextArea } from '@mando-collabs/tailwind-ui';
import { useState } from 'react';
import type { ActionFunction } from '@remix-run/node';
import { handleNewMarketEventForm, newMarketEventValidator } from '~/forms/new-market-event';
import { ValidatedForm } from 'remix-validated-form';
import { AddressFields } from '~/components/AddressFields';

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();

  return await handleNewMarketEventForm(formData);
};

export default function NewMarketEvent() {
  const [addressId, setAddressId] = useState<string | undefined>(undefined);

  return (
    <PageWrapper title="New Market Event">
      <ValidatedForm method="post" validator={newMarketEventValidator} className="mt-4">
        <fieldset>
          <RVFInput label="Market Date" type="date" name="marketDate" />
          <RVFSelectNative
            className="mt-4"
            value={addressId}
            onChange={(e) => setAddressId(e.target.value)}
            label="Address"
            options={[]}
            placeholder="Create new"
            name="addressId"
          />
          {!addressId ? <AddressFields className="mt-4" namePrefix="address" /> : null}
          <RVFTextArea className="mt-4" label="Notes" name="notes" />
        </fieldset>

        <RVFButton className="mt-4 mr-2">Create Event</RVFButton>
      </ValidatedForm>
    </PageWrapper>
  );
}
