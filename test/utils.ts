import type { User } from '@prisma/client';
import { faker } from '@faker-js/faker';

export function createTestUser(options?: Partial<User>) {
  return Object.assign(
    {
      id: faker.random.numeric(),
      email: faker.internet.email(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      isAdmin: false,
      name: faker.name.findName(),
    },
    options
  );
}
