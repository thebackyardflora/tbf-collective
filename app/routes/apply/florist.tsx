import { RVFButton, RVFInput } from '@mando-collabs/tailwind-ui';
import { ValidatedForm, validationError } from 'remix-validated-form';
import { z } from 'zod';
import { withZod } from '@remix-validated-form/with-zod';
import { zfd } from 'zod-form-data';
import type { ActionFunction } from '@remix-run/node';

const validator = withZod(
  z.object({
    businessOwnerName: zfd.text(z.string()),
    businessName: zfd.text(z.string()),
    einTin: zfd.text(z.string()),
    website: zfd.text(z.string().optional()),
    instagramHandle: zfd.text(z.string().optional()),
    email: zfd.text(z.string().email()),
    phone: zfd.text(z.string()),
    businessAddress: zfd.text(z.string()),
    yearsInBusiness: zfd.text(z.string()),
  })
);

export const action: ActionFunction = async ({ request }) => {
  const validationResult = await validator.validate(await request.formData());

  if (validationResult.error) {
    return validationError(validationResult.error);
  }

  return null;
};

export default function FloristApplication() {
  return (
    <div className="mx-auto mt-8">
      <ValidatedForm method="post" validator={validator}>
        <div className="grid-cols-2 gap-8 space-y-4 pb-8 lg:grid lg:space-y-0">
          <RVFInput
            type="text"
            name="businessOwnerName"
            label="Business Owner Name"
            placeholder="Jane Doe"
            autoComplete="name"
          />
          <RVFInput
            type="text"
            name="businessName"
            label="Business Name"
            placeholder="Acme Flowers Inc."
            autoComplete="organization"
          />
          <RVFInput type="text" name="einTin" label="EIN/TIN" placeholder="XX-XXXXXXX" />
          <RVFInput type="url" name="website" label="Website" placeholder="https://example.com" />
          <RVFInput type="text" name="instagramHandle" label="Instagram Handle" placeholder="@your_handle" />
          <RVFInput type="email" name="email" label="Email" placeholder="you@example.com" autoComplete="email" />
          <RVFInput
            type="tel"
            name="phone"
            label="Contact Phone Number"
            placeholder="208-123-4567"
            autoComplete="tel"
          />
          <RVFInput
            type="text"
            name="businessAddress"
            label="Business Address"
            placeholder="123 Easy Street, Rexburg, ID 83440"
          />
          <RVFInput type="text" name="yearsInBusiness" label="How many years have you been in business?" />
        </div>
        <div className="justify-end lg:flex">
          <RVFButton>Submit application</RVFButton>
        </div>
      </ValidatedForm>
    </div>
  );
}
