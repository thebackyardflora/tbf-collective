// Use this to create a new user and login with that user
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-user.ts username@example.com
// and it will log out the cookie value you can use to interact with the server
// as that new user.

import { parse } from 'cookie';
import { installGlobals } from '@remix-run/node';
import { createUserSession } from '~/session.server';
import { createUser } from '~/models/user.server';
import { faker } from '@faker-js/faker';

installGlobals();

async function create(email: string, isAdmin: boolean) {
  if (!email) {
    throw new Error('email required for login');
  }
  if (!email.endsWith('@example.com')) {
    throw new Error('All test emails must end in @example.com');
  }

  return await createUser({ email, password: 'myreallystrongpassword', isAdmin, name: faker.name.fullName() });
}

async function createAndLogin(email: string, isAdmin: boolean) {
  const user = await create(email, isAdmin);

  const response = await createUserSession({
    request: new Request('test://test'),
    userId: user.id,
    remember: false,
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
<id>
  ${user.id}
</id>
  `.trim()
  );
}

async function createOnly(email: string, isAdmin: boolean) {
  const user = await create(email, isAdmin);

  console.log(
    `
<id>
  ${user.id}
</id>
  `.trim()
  );
}

const login = process.argv[2] === 'true';
const email = process.argv[3];
const isAdmin = process.argv[4] === 'true';

console.log('login', process.argv[2]);

if (login) {
  createAndLogin(email, isAdmin);
} else {
  createOnly(email, isAdmin);
}
