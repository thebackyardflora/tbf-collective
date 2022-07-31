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
import { useEffect, useRef, useState } from 'react';
import type { SerializedEntity } from '~/types';
import { ImagePreview } from '~/components/ImagePreview';

export interface ProfilePageProps {
  user: SerializedEntity<User>;
  company: Omit<SerializedEntity<Company>, 'imageKey'> & { imageUrl: string | null };
  socialSites: SerializedEntity<SocialSite>[];
}

function isFocusedHtmlElement(element: Element | null): element is HTMLElement {
  return element instanceof HTMLElement && element.tabIndex > -1;
}

export const ProfilePage: FC<ProfilePageProps> = ({ user, company, socialSites }) => {
  const actionData = useActionData();
  const instagramUrl = socialSites.find((site) => site.type === SocialSiteType.INSTAGRAM)?.url ?? undefined;
  const instagramHandle = instagramUrl ? parseInstagramHandleFromUrl(instagramUrl) : undefined;

  const [previewFile, setPreviewFile] = useState<File | null>(null);

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
      <PageWrapper title="Company Profile">
        <p className="mb-4 text-gray-500">This information will be displayed on your company's public profile</p>
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
          encType="multipart/form-data"
        >
          <div className="flex flex-col space-y-4">
            <div className="flex-grow ">
              <p className="text-sm font-medium text-gray-700" aria-hidden="true">
                Photo
              </p>
              <div className="mt-1">
                <div className="flex items-center">
                  <div className="inline-block h-40 w-40 flex-shrink-0 overflow-hidden rounded-full" aria-hidden="true">
                    <ImagePreview file={previewFile} imageUrl={company.imageUrl} />
                  </div>
                  <div className="ml-5 rounded-md shadow-sm">
                    <div className="group relative flex items-center justify-center rounded-md border border-gray-300 py-2 px-3 focus-within:ring-2 focus-within:ring-sky-500 focus-within:ring-offset-2 hover:bg-gray-50">
                      <label
                        htmlFor="companyImage"
                        className="pointer-events-none relative text-sm font-medium leading-4 text-gray-700"
                      >
                        <span>Change</span>
                        <span className="sr-only"> user photo</span>
                      </label>
                      <input
                        id="companyImage"
                        name="companyImage"
                        accept="image/png, image/jpeg"
                        type="file"
                        className="absolute h-full w-full cursor-pointer rounded-md border-gray-300 opacity-0"
                        onChange={(e) => setPreviewFile(e.target.files?.[0] ?? null)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
          encType="multipart/form-data"
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
          encType="multipart/form-data"
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
