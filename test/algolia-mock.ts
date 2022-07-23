import { vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';
import { algoliaIndex } from '~/algolia.server';
import type { SearchIndex } from 'algoliasearch/dist/algoliasearch';

vi.mock('~/algolia.server', () => {
  return {
    __esModule: true,
    algoliaIndex: mockDeep<SearchIndex>(),
  };
});

export const algoliaIndexMock = algoliaIndex as DeepMockProxy<typeof algoliaIndex>;
