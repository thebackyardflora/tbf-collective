import { createCookieSessionStorage } from '@remix-run/node';
import invariant from 'tiny-invariant';

invariant(process.env.SESSION_SECRET, 'SESSION_SECRET must be set');

const { getSession, destroySession, ...sessionStorage } = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
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
