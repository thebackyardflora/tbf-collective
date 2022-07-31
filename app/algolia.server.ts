import algoliasearch from 'algoliasearch';
import invariant from 'tiny-invariant';

invariant(process.env.ALGOLIA_APP_ID, 'Please set the ALGOLIA_APP_ID environment variable');
invariant(process.env.ALGOLIA_API_KEY, 'Please set the ALGOLIA_API_KEY environment variable');
invariant(process.env.ALGOLIA_INDEX_NAME, 'Please set the ALGOLIA_INDEX_NAME environment variable');

export const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

export const algoliaIndex = algoliaClient.initIndex(process.env.ALGOLIA_INDEX_NAME);
