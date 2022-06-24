import { createCookieSessionStorage } from '@remix-run/node';
import { getRequiredEnvVariable } from '~/env.server';

const sessionSecret = getRequiredEnvVariable('SESSION_SECRET');

const { getSession, destroySession, ...sessionStorage } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    maxAge: 1000 * 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === 'production',
  },
});

type CommitSession = typeof sessionStorage.commitSession;

const commitSession: CommitSession = async (session, options) => {
  return await sessionStorage.commitSession(session, {
    ...options,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  });
};

export { getSession, destroySession, commitSession };
