import type { ActionArgs, LoaderArgs, MetaFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useSearchParams } from '@remix-run/react';
import * as React from 'react';

import { createUserSession, getUserId } from '~/session.server';

import { createUser, getUserByEmail } from '~/models/user.server';
import { safeRedirect, validateEmail, validateName } from '~/utils';
import { Button, Input } from '@mando-collabs/tailwind-ui';

export async function loader({ request }: LoaderArgs) {
  const userId = await getUserId(request);

  if (userId) return redirect('/');

  return null;
}

interface ActionData {
  errors: {
    email?: string;
    name?: string;
    password?: string;
  };
}

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const name = formData.get('name');
  const redirectTo = safeRedirect(formData.get('redirectTo'), '/');

  if (!validateEmail(email)) {
    return json<ActionData>({ errors: { email: 'Email is invalid' } }, { status: 400 });
  }

  if (!validateName(name)) {
    return json<ActionData>({ errors: { name: 'Please enter a real name' } }, { status: 400 });
  }

  if (typeof password !== 'string' || password.length === 0) {
    return json<ActionData>({ errors: { password: 'Password is required' } }, { status: 400 });
  }

  if (password.length < 8) {
    return json<ActionData>({ errors: { password: 'Password is too short' } }, { status: 400 });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return json<ActionData>({ errors: { email: 'A user already exists with this email' } }, { status: 400 });
  }

  const user = await createUser({ email, password, name });

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo,
  });
}

export const meta: MetaFunction = () => {
  return {
    title: 'Sign Up',
  };
};

export default function SignUp() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? undefined;
  const actionData = useActionData() as ActionData;

  return (
    <div className="flex min-h-full flex-col justify-center">
      <div className="mx-auto w-full max-w-md px-8">
        <Form method="post" className="space-y-6" noValidate>
          <Input
            type="text"
            name="name"
            id="name"
            label="Full name"
            required
            autoComplete="name"
            autoFocus={true}
            errorText={actionData?.errors?.name}
          />

          <Input
            type="email"
            name="email"
            id="email"
            label="Email address"
            required
            autoComplete="email"
            errorText={actionData?.errors?.email}
          />

          <Input
            type="password"
            name="password"
            id="password"
            label="Password"
            required
            autoComplete="new-password"
            errorText={actionData?.errors?.password}
          />

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Button type="submit" className="w-full" size="lg">
            Create Account
          </Button>
          <div className="flex items-center justify-center">
            <div className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link
                className="text-primary-600 underline"
                to={{
                  pathname: '/login',
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
