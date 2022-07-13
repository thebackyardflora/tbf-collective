import type { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '~/db.server';

export async function updatePassword({
  currentPassword,
  newPassword,
  userId,
}: {
  currentPassword: string;
  newPassword: string;
  userId: User['id'];
}) {
  const userPassword = await prisma.password.findUnique({ where: { userId } });

  if (!userPassword) throw new Error('User does not have a password');

  let isValid = await bcrypt.compare(currentPassword, userPassword.hash);

  if (!isValid) {
    throw new InvalidPasswordError('Password is incorrect.');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.password.update({ where: { userId }, data: { hash: hashedPassword } });
}

export class InvalidPasswordError extends Error {}
