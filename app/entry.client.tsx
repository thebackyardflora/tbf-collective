import { Link, RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';
import React from 'react';
import { setLinkComponent } from '@mando-collabs/tailwind-ui';

setLinkComponent(Link);

function hydrate() {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  window.setTimeout(hydrate, 1);
}
