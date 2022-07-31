import type { FC, ReactNode } from 'react';
import { createContext, useContext, useState } from 'react';
import type { SearchClient } from 'algoliasearch/lite';
import algoliasearch from 'algoliasearch/lite';

const algoliaContext = createContext<SearchClient | null>(null);

interface AlgoliaProviderProps {
  children?: ReactNode;
  appId: string;
  apiKey: string;
}

export const AlgoliaProvider: FC<AlgoliaProviderProps> = ({ children, apiKey, appId }) => {
  const [client] = useState<SearchClient | null>(algoliasearch(appId, apiKey));

  return <algoliaContext.Provider value={client}>{children}</algoliaContext.Provider>;
};

export const useAlgolia = () => {
  const client = useContext(algoliaContext);

  if (!client) {
    throw new Error('useAlgolia must be used within an AlgoliaProvider');
  }

  return client;
};
