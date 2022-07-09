import type { Application } from '@prisma/client';
import { prisma } from '~/db.server';
import { ApplicationStatus } from '@prisma/client';

export function isApplicationStatus(val: unknown): val is ApplicationStatus {
  return typeof val === 'string' && Object.values(ApplicationStatus).includes(val as ApplicationStatus);
}

export async function getApplicationByUserId(userId: string): Promise<Application | null> {
  return await prisma.application.findUnique({ where: { userId } });
}

export async function getAllApplicationsByStatus(status: ApplicationStatus): Promise<Application[]> {
  return prisma.application.findMany({ where: { status } });
}

export async function getApplicationById(id: string): Promise<Application | null> {
  return prisma.application.findUnique({ where: { id } });
}

export async function setApplicationStatus({ id, status }: { id: string; status: ApplicationStatus }): Promise<void> {
  await prisma.application.update({ where: { id }, data: { status } });
}
