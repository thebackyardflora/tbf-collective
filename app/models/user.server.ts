import type { User } from '@prisma/client';

import { prisma } from '~/db.server';

export type { User } from '@prisma/client';

export async function findOrCreateUser({ email, externalId }: Pick<User, 'email' | 'externalId'>) {
  return prisma.user.upsert({
    where: { externalId },
    create: { externalId, email },
    update: { externalId, email },
  });
}

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } });
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } });
}
