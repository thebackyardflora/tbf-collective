import type { FC } from 'react';
import { PageWrapper } from '~/components/PageWrapper';
import { Form } from '@remix-run/react';
import { Button, Input, TextArea } from '@mando-collabs/tailwind-ui';
import { LogoutIcon } from '@heroicons/react/outline';
import Avatar from 'boring-avatars';
import type { Company, User } from '@prisma/client';

export interface ProfilePageProps {
  user: User;
  company: Company | null;
}

export const ProfilePage: FC<ProfilePageProps> = ({ user, company }) => {
  return (
    <>
      <PageWrapper title="Public Profile">
        <p className="mb-4 text-gray-500">This information will be displayed on your public profile</p>
        <div className="flex flex-col lg:flex-row">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mr-8 lg:flex-1">
            <Input type="text" name="businessName" label="Business Name" />
            <Input type="text" name="businessOwnerName" label="Business Owner Name" />
            <TextArea
              className="my-2 sm:col-span-2"
              label="About"
              helpText="Give a brief description of your company"
            />
            <Input type="text" name="instagramHandle" label="Instagram" />
            <Input type="url" name="website" label="Website" />
          </div>
          <div className="mt-4 flex flex-col items-center lg:mt-0 lg:items-start">
            <div className="mb-4 text-sm font-medium text-gray-700">Profile Image</div>
            <div className="h-40 w-40 overflow-hidden rounded-full">
              <Avatar name={user.name} colors={['#78866B', '#8f9779', '#ffe8d6', '#cb997e', '#b98b73']} size={160} />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button>Save</Button>
        </div>
      </PageWrapper>
      <PageWrapper title="Account" titleClassName="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
        <p className="text-gray-500">This information is kept private</p>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Input type="text" name="einTin" label="EIN/TIN" helpText="This is used for tax purposes" />
          <Input type="email" name="email" label="Email" />
          <Input type="tel" name="phone" label="Phone Number" />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <Button>Save</Button>
        </div>
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
