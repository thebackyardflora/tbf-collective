import type { Application } from '@prisma/client';
import { prisma } from '~/db.server';

export async function getApplicationByUserId(userId: string): Promise<Application | null> {
  return await prisma.application.findUnique({ where: { userId } });
}
