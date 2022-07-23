import type { LinksFunction, LoaderArgs, MetaFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from '@remix-run/react';

import tailwindStylesheetUrl from './styles/tailwind.css';
import { getUser } from '~/session.server';
import { json } from '@remix-run/node';
import { AlgoliaProvider } from '~/components/AlgoliaProvider';
import invariant from 'tiny-invariant';

export const links: LinksFunction = () => {
  return [{ rel: 'stylesheet', href: tailwindStylesheetUrl }];
};

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'The Backyard Flora Collective',
  viewport: 'width=device-width,initial-scale=1',
});

export async function loader({ request }: LoaderArgs) {
  invariant(process.env.ALGOLIA_APP_ID, 'ALGOLIA_APP_ID is required');
  invariant(process.env.ALGOLIA_API_KEY, 'ALGOLIA_API_KEY is required');

  return json({
    user: await getUser(request),
    algoliaAppId: process.env.ALGOLIA_APP_ID,
    algoliaApiKey: process.env.ALGOLIA_API_KEY,
  });
}

export default function App() {
  const { algoliaAppId, algoliaApiKey } = useLoaderData<typeof loader>();

  return (
    <html lang="en" className="h-full">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <AlgoliaProvider appId={algoliaAppId} apiKey={algoliaApiKey}>
          <Outlet />
        </AlgoliaProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
