import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';
import React from 'react';

requestIdleCallback(() => {
  React.startTransition(() => {
    hydrateRoot(
      document,
      <React.StrictMode>
        <RemixBrowser />
      </React.StrictMode>
    );
  });
});
