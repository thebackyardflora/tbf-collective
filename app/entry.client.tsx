import { Link, RemixBrowser } from '@remix-run/react';
import { hydrate } from 'react-dom';
import { setLinkComponent } from '@mando-collabs/tailwind-ui';

setLinkComponent(Link);

hydrate(<RemixBrowser />, document);
