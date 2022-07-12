import type { FC } from 'react';
import { PageWrapper } from '~/components/PageWrapper';
import { Form } from '@remix-run/react';
import { Button, Input, RVFButton, RVFInput, RVFTextArea } from '@mando-collabs/tailwind-ui';
import { LogoutIcon } from '@heroicons/react/outline';
import Avatar from 'boring-avatars';
import type { Company, User, SocialSite } from '@prisma/client';
import { SocialSiteType } from '@prisma/client';
import { ValidatedForm } from 'remix-validated-form';
import { companyProfileValidator } from '~/forms/company-profile';
import { parseInstagramHandleFromUrl } from '~/utils';
import { accountSettingsValidator } from '~/forms/account-settings';

export interface ProfilePageProps {
  user: User;
  company: Company;
  socialSites: SocialSite[];
}

export const ProfilePage: FC<ProfilePageProps> = ({ user, company, socialSites }) => {
  const instagramUrl = socialSites.find((site) => site.type === SocialSiteType.INSTAGRAM)?.url ?? undefined;
  const instagramHandle = instagramUrl ? parseInstagramHandleFromUrl(instagramUrl) : undefined;

  const websiteUrl = socialSites.find((site) => site.type === SocialSiteType.WEBSITE)?.url ?? undefined;

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mr-8 lg:flex-1">
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
            <div className="mt-4 flex flex-col items-center lg:mt-0 lg:items-start">
              <div className="mb-4 text-sm font-medium text-gray-700">Profile Image</div>
              <div className="h-40 w-40 overflow-hidden rounded-full">
                <Avatar name={user.name} colors={['#78866B', '#8f9779', '#ffe8d6', '#cb997e', '#b98b73']} size={160} />
              </div>
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

        <Form className="my-6 rounded-lg border p-4 lg:px-8 lg:pt-6 lg:pb-8">
          <h3 className="mb-4 font-medium">Reset Password</h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Input type="password" name="password" label="Current Password" />
            <Input type="password" name="newPassword" label="New Password" />
            <Input type="password" name="confirmPassword" label="Confirm New Password" />
          </div>
          <Button className="mt-4" type="submit" kind="secondary">
            Update password
          </Button>
        </Form>
        <Form method="post" action="/logout" className="mt-4">
          <Button type="submit" kind="white" leadingIcon={LogoutIcon}>
            Logout
          </Button>
        </Form>
      </PageWrapper>
    </>
  );
};
