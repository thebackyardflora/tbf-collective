import type { User } from '@prisma/client';
import { CompanyType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import type { z } from 'zod';
import type { floristApplicationSchema } from '~/components/FloristApplication';
import type { upsertCompany } from '~/models/company.server';

export function createTestUser(options?: Partial<User>) {
  return Object.assign(
    {
      id: faker.random.numeric(),
      email: faker.internet.email(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past(),
      isAdmin: false,
      name: faker.name.fullName(),
    },
    options
  );
}

export function createTestFloristApplication(): z.infer<typeof floristApplicationSchema> {
  return {
    businessAddress: faker.address.streetAddress(true),
    businessName: faker.company.name(),
    businessOwnerName: faker.name.fullName(),
    einTin: faker.finance.bic(),
    email: faker.internet.email(),
    instagramHandle: faker.internet.userName(),
    phone: faker.phone.number('208-5##-1###'),
    website: faker.internet.url(),
    yearsInBusiness: faker.random.numeric(1),
    accessToCooler: faker.datatype.boolean(),
  };
}

export function createTestFloristApplicationFormData(): Omit<
  z.infer<typeof floristApplicationSchema>,
  'accessToCooler'
> & { accessToCooler: 'on' | undefined | null } {
  return {
    businessAddress: faker.address.streetAddress(true),
    businessName: faker.company.name(),
    businessOwnerName: faker.name.fullName(),
    einTin: faker.finance.bic(),
    email: faker.internet.email(),
    instagramHandle: faker.internet.userName(),
    phone: faker.phone.number('208-5##-1###'),
    website: faker.internet.url(),
    yearsInBusiness: faker.random.numeric(1),
    accessToCooler: 'on',
  };
}

export function createTestCompanyCreateData(
  { active, type = CompanyType.FLORIST }: { active?: boolean; type?: CompanyType } = {
    active: false,
    type: CompanyType.FLORIST,
  }
): Parameters<typeof upsertCompany>[0] {
  return {
    active,
    name: faker.company.name(),
    ownerName: faker.name.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number('208-5##-1###'),
    einTin: faker.finance.bic(),
    type,
    ownerId: faker.datatype.uuid(),
    address: faker.address.streetAddress(true),
    website: faker.internet.url(),
    instagramHandle: faker.internet.userName(),
  };
}
