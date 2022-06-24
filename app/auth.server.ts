import { Authenticator } from 'remix-auth';
import { Auth0Strategy } from 'remix-auth-auth0';
import type { User } from '~/models/user.server';
import { findOrCreateUser, getUserById } from '~/models/user.server';
import * as sessionStorage from '~/session.server';
import { getRequiredEnvVariable } from '~/env.server';
import { redirect } from '@remix-run/node';

const clientId = getRequiredEnvVariable('AUTH0_CLIENT_ID');
const clientSecret = getRequiredEnvVariable('AUTH0_CLIENT_SECRET');
const domain = getRequiredEnvVariable('AUTH0_DOMAIN');
const publicHost = getRequiredEnvVariable('PUBLIC_HOST');

export const authenticator = new Authenticator<User>(sessionStorage);

const auth0Strategy = new Auth0Strategy(
  {
    callbackURL: `${publicHost}/auth/auth0/callback`,
    clientID: clientId,
    clientSecret: clientSecret,
    domain: domain,
  },
  async ({ profile }) => {
    // Get the user data from your DB or API using the tokens and profile
    return findOrCreateUser({ externalId: profile.id, email: profile.emails[0].value });
  }
);

authenticator.use(auth0Strategy);

const USER_SESSION_KEY = 'user';

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function getUserId(request: Request): Promise<User['id'] | undefined> {
  const session = await getSession(request);
  return session.get(USER_SESSION_KEY)?.id ?? undefined;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (userId === undefined) return null;

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const userId = await getUserId(request);
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request);

  const user = await getUserById(userId);
  if (user) return user;

  throw await logout(request);
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}
