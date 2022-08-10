import { vi } from 'vitest';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';
import { catalogIndex } from '~/algolia.server';
import type { SearchIndex } from 'algoliasearch/dist/algoliasearch';

vi.mock('~/algolia.server', () => {
  return {
    __esModule: true,
    catalogIndex: mockDeep<SearchIndex>(),
  };
});

export const algoliaIndexMock = catalogIndex as DeepMockProxy<typeof catalogIndex>;
