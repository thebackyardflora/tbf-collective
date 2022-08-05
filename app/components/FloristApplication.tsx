import { RVFButton, RVFCheckbox, RVFInput } from '@mando-collabs/tailwind-ui';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';
import { withZod } from '@remix-validated-form/with-zod';
import { zfd } from 'zod-form-data';
import { CompanyType } from '@prisma/client';

export const floristApplicationSchema = z.object({
  businessOwnerName: zfd.text(z.string()),
  businessName: zfd.text(z.string()),
  einTin: zfd.text(z.string()),
  website: zfd.text(z.string().optional()),
  instagramHandle: zfd.text(z.string().optional()),
  email: zfd.text(z.string().email()),
  phone: zfd.text(z.string()),
  businessAddress: zfd.text(z.string()),
  yearsInBusiness: zfd.text(z.string()),
  accessToCooler: zfd.checkbox({ trueValue: 'on' }),
});

export const floristApplicationValidator = withZod(floristApplicationSchema);

export default function FloristApplication() {
  return (
    <div className="mx-auto mt-8 pb-8">
      <ValidatedForm method="post" action={`?type=${CompanyType.FLORIST}`} validator={floristApplicationValidator}>
        <div className="grid-cols-2 gap-8 space-y-4 pb-8 lg:grid lg:space-y-0">
          <RVFInput type="text" name="businessOwnerName" label="Business Owner Name" autoComplete="name" />
          <RVFInput type="text" name="businessName" label="Business Name" autoComplete="organization" />
          <RVFInput type="text" name="einTin" label="EIN/TIN" placeholder="XX-XXXXXXX" />
          <RVFInput
            type="url"
            name="website"
            label="Website"
            cornerHint="Optional"
            placeholder={`https://www.example.com`}
            helpText='Be sure to include "https://"'
          />
          <RVFInput type="text" name="instagramHandle" label="Instagram Handle" cornerHint="Optional" />
          <RVFInput type="email" name="email" label="Email" placeholder="you@example.com" autoComplete="email" />
          <RVFInput type="tel" name="phone" label="Contact Phone Number" autoComplete="tel" />
          <RVFInput type="text" name="businessAddress" label="Business Address" />
          <RVFInput type="text" name="yearsInBusiness" label="How many years have you been in business?" />
          <RVFCheckbox
            name="accessToCooler"
            label="Cooler access"
            description="Do you have access to a floral cooler?"
          />
        </div>
        <div className="justify-end lg:flex">
          <RVFButton>Submit application</RVFButton>
        </div>
      </ValidatedForm>
    </div>
  );
}
