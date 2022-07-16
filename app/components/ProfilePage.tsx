import type { FC } from 'react';
import { PageWrapper } from '~/components/PageWrapper';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { Button, Input, RVFButton, RVFInput, RVFTextArea } from '@mando-collabs/tailwind-ui';
import { CheckCircleIcon, LogoutIcon } from '@heroicons/react/outline';
import type { Company, User, SocialSite } from '@prisma/client';
import { SocialSiteType } from '@prisma/client';
import { ValidatedForm } from 'remix-validated-form';
import { companyProfileValidator } from '~/forms/company-profile';
import { parseInstagramHandleFromUrl } from '~/utils';
import { accountSettingsValidator } from '~/forms/account-settings';
import { changePasswordFormValidator } from '~/forms/change-password';
import { useEffect, useRef } from 'react';
import type { SerializedEntity } from '~/types';

export interface ProfilePageProps {
  user: SerializedEntity<User>;
  company: SerializedEntity<Company>;
  socialSites: SerializedEntity<SocialSite>[];
}

function isFocusedHtmlElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.tabIndex > -1;
}

export const ProfilePage: FC<ProfilePageProps> = ({ user, company, socialSites }) => {
  const actionData = useActionData();
  const instagramUrl = socialSites.find((site) => site.type === SocialSiteType.INSTAGRAM)?.url ?? undefined;
  const instagramHandle = instagramUrl ? parseInstagramHandleFromUrl(instagramUrl) : undefined;

  const websiteUrl = socialSites.find((site) => site.type === SocialSiteType.WEBSITE)?.url ?? undefined;

  const { state, submission } = useTransition();
  const isUpdatingPassword = state === 'submitting' && submission?.formData.has('changePassword');
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (!isUpdatingPassword) {
      formRef.current?.reset();
      isFocusedHtmlElement(document.activeElement) && document.activeElement?.blur();
    }
  }, [isUpdatingPassword]);

  return (
    <>
      <PageWrapper title="Public Profile">
        <p className="mb-4 text-gray-500">This information will be displayed on your public profile</p>
        <ValidatedForm
          method="post"
          validator={companyProfileValidator}
          defaultValues={{
            name: company.name,
            ownerName: company.ownerName,
            bio: company.bio ?? undefined,
            instagramHandle: instagramHandle ?? undefined,
            website: websiteUrl,
          }}
        >
          <div className="flex flex-col lg:flex-row">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:flex-1">
              <RVFInput type="text" name="name" label="Business Name" />
              <RVFInput type="text" name="ownerName" label="Business Owner Name" />
              <RVFTextArea
                name="bio"
                className="my-2 sm:col-span-2"
                label="About"
                helpText="Give a brief description of your company"
              />
              <RVFInput type="text" name="instagramHandle" label="Instagram" />
              <RVFInput type="url" name="website" label="Website" />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <RVFButton name="companyProfile">Save</RVFButton>
          </div>
        </ValidatedForm>
      </PageWrapper>
      <PageWrapper title="Account" titleClassName="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
        <p className="text-gray-500">This information is kept private</p>
        <ValidatedForm
          method="post"
          validator={accountSettingsValidator}
          defaultValues={{
            phone: company.phone ?? undefined,
            email: company.email ?? undefined,
            einTin: company.einTin,
          }}
        >
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RVFInput type="email" name="email" label="Email" />
            <RVFInput type="tel" name="phone" label="Phone Number" />
            <RVFInput type="text" name="einTin" label="EIN/TIN" helpText="This is used for tax purposes" />
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <RVFButton name="accountSettings">Save</RVFButton>
          </div>
        </ValidatedForm>
      </PageWrapper>
      <PageWrapper title="Security" titleClassName="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
        <p className="text-gray-500">Keep your account secure</p>

        <ValidatedForm
          formRef={formRef}
          method="post"
          validator={changePasswordFormValidator}
          className="my-6 rounded-lg border p-4 lg:px-8 lg:pt-6 lg:pb-8"
        >
          <h3 className="mb-4 font-medium">Reset Password</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RVFInput type="password" name="currentPassword" autoComplete="current-password" label="Current Password" />
            <RVFInput type="password" name="newPassword" autoComplete="new-password" label="New Password" />
            <RVFInput type="password" name="confirmPassword" autoComplete="new-password" label="Confirm New Password" />
            <Input
              className="hidden"
              type="email"
              readOnly
              defaultValue={user.email}
              name="email"
              autoComplete="username"
              id="hidden-email"
            />
          </div>
          <RVFButton className="mt-4" kind="secondary" name="changePassword">
            Update password
          </RVFButton>
          {actionData?.passwordUpdated ? (
            <p className="mt-2 flex items-center text-green-800">
              <CheckCircleIcon className="mr-2 h-4 w-4" /> Your password was successfully updated.
            </p>
          ) : null}
        </ValidatedForm>
        <Form method="post" action="/logout" className="mt-4">
          <Button type="submit" kind="white" leadingIcon={LogoutIcon}>
            Logout
          </Button>
        </Form>
      </PageWrapper>
    </>
  );
};
