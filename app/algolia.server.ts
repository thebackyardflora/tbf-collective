import algoliasearch from 'algoliasearch';
import invariant from 'tiny-invariant';

const env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

invariant(process.env.ALGOLIA_APP_ID, 'Please set the ALGOLIA_APP_ID environment variable');
invariant(process.env.ALGOLIA_API_KEY, 'Please set the ALGOLIA_API_KEY environment variable');
invariant(process.env.ALGOLIA_INDEX_NAME, 'Please set the ALGOLIA_INDEX_NAME environment variable');

export const algoliaClient = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

export const catalogIndexName = `${env}_tbf_collective`;
export const catalogIndex = algoliaClient.initIndex(catalogIndexName);

export const marketInventoryIndexName = `${env}-market-inventory`;
export const marketInventoryIndex = algoliaClient.initIndex(marketInventoryIndexName);
