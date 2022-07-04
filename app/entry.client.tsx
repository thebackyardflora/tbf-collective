import { RemixBrowser } from '@remix-run/react';
import { hydrateRoot } from 'react-dom/client';

console.log('Hydrating in env:', process.env.NODE_ENV);

if (process.env.NODE_ENV === 'test') {
  require('react-dom').hydrate(<RemixBrowser />, document);
} else {
  hydrateRoot(document, <RemixBrowser />);
}
