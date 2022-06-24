// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { parse } from 'cookie';
import { installGlobals } from '@remix-run/node/globals';
import { commitSession, getSession } from '~/session.server';
import type { User } from '~/models/user.server';
import { findOrCreateUser } from '~/models/user.server';
import { faker } from '@faker-js/faker';
import { redirect } from '@remix-run/server-runtime';

installGlobals();

async function createUserSession({ request, user, redirectTo }: { request: Request; user: User; redirectTo: string }) {
  const session = await getSession(request.headers.get('Cookie'));
  session.set('user', user);

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

async function createAndLogin(email: string) {
  console.log('2', process.env);

  if (!email) {
    throw new Error('email required for login');
  }
  if (!email.endsWith('@example.com')) {
    throw new Error('All test emails must end in @example.com');
  }

  const user = await findOrCreateUser({ email, externalId: faker.datatype.string() });

  const response = await createUserSession({
    request: new Request('test://test'),
    user,
    redirectTo: '/',
  });

  const cookieValue = response.headers.get('Set-Cookie');
  if (!cookieValue) {
    throw new Error('Cookie missing from createUserSession response');
  }
  const parsedCookie = parse(cookieValue);
  // we log it like this so our cypress command can parse it out and set it as
  // the cookie value.
  console.log(
    `
<cookie>
  ${parsedCookie.__session}
</cookie>
  `.trim()
  );
}

createAndLogin(process.argv[2]);
