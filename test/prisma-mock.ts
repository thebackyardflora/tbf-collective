import type { PrismaClient } from '@prisma/client';
import type { DeepMockProxy } from 'vitest-mock-extended';
import { mockDeep } from 'vitest-mock-extended';
import { vi } from 'vitest';
import { prisma } from '~/db.server';

vi.mock('~/db.server', () => {
  return {
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
  };
});

export const prismaMock = prisma as DeepMockProxy<typeof prisma>;
