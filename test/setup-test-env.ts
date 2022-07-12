import { installGlobals } from '@remix-run/node';
import '@testing-library/jest-dom/extend-expect';
import { prismaMock } from './prisma-mock';
import { mockReset } from 'vitest-mock-extended';
import { sessionMock } from './session-mock';

vi.mock('tiny-invariant');

function isMockFn(fn: Function) {
  return fn.hasOwnProperty('mockClear');
}

function resetMocksDeep(mocks: any) {
  Object.keys(mocks).forEach((key) => {
    if (typeof mocks[key] === 'function' && isMockFn(mocks[key])) {
      mocks[key].mockReset();
    } else if (typeof mocks[key] === 'object' && !Array.isArray(mocks[key]) && mocks[key] !== null) {
      resetMocksDeep(mocks[key]);
    }
  });
}

beforeEach(() => {
  mockReset(prismaMock);
  resetMocksDeep(sessionMock);
});

installGlobals();
