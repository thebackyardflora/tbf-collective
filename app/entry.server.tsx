import type { EntryContext } from '@remix-run/node';
import { Link, RemixServer } from '@remix-run/react';
import { renderToString } from 'react-dom/server';
import { setLinkComponent } from '@mando-collabs/tailwind-ui';

setLinkComponent(Link);

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const markup = renderToString(<RemixServer context={remixContext} url={request.url} />);

  responseHeaders.set('Content-Type', 'text/html');

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}
