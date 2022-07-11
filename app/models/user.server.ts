import type { Password, User, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { prisma } from '~/db.server';

export type { User } from '@prisma/client';

export async function getUserById(id: User['id']) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User['email']) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserWithCompany(id: User['id']) {
  return prisma.user.findUnique({ where: { id }, include: { company: true } });
}

interface CreateUserParams {
  email: Prisma.UserCreateInput['email'];
  password: string;
  isAdmin?: Prisma.UserCreateInput['isAdmin'];
  name: Prisma.UserCreateInput['name'];
}

export async function createUser({ email, name, password, isAdmin }: CreateUserParams) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      name,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
      isAdmin,
    },
  });
}

export async function deleteUserByEmail(email: User['email']) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(email: User['email'], password: Password['hash']) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash);

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}
