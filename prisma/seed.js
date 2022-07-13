const { PrismaClient, ApplicationStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function createUser({ email, isAdmin, name }) {
  const hashedPassword = await bcrypt.hash('password', 10);

  return await prisma.user.upsert({
    create: {
      email,
      name,
      isAdmin,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
    update: {
      email,
      name,
      isAdmin,
    },
    where: {
      email,
    },
  });
}

function getFakeApplicationData(company) {
  return {
    businessName: company.name,
    businessOwnerName: company.ownerName,
    einTin: company.einTin,
    website: faker.internet.url(),
    instagramHandle: faker.internet.userName(),
    email: company.email,
    phone: company.phone,
    businessAddress: company.address,
    yearsInBusiness: faker.random.numeric(1).toString(),
  };
}

function getFakeCompanyData() {
  return {
    address: faker.address.streetAddress(true),
    name: faker.company.companyName(),
    ownerName: faker.name.findName(),
    einTin: faker.finance.bic(),
    email: faker.internet.email(),
    phone: faker.phone.number('208-5##-1###'),
  };
}

function getFakeAddressData() {
  return {
    street1: faker.address.streetAddress(true),
    city: faker.address.city(),
    state: faker.address.state(),
    zip: faker.address.zipCode(),
  };
}

function getFakeMarketEventData() {
  return {
    marketDate: Math.random() > 0.5 ? faker.date.future() : faker.date.past(),
    address: {
      create: getFakeAddressData(),
    },
    isCanceled: Math.random() > 0.7,
    notes: faker.lorem.paragraph(),
  };
}

async function createApplication({ type, userId, status, company }) {
  await prisma.application.upsert({
    create: {
      userId,
      type,
      payloadJson: getFakeApplicationData(company),
      status,
    },
    update: {
      userId,
      type,
      payloadJson: getFakeApplicationData(company),
      status,
    },
    where: {
      userId,
    },
  });
}

async function createCompany({ type, ownerId, active, company }) {
  await prisma.company.upsert({
    create: {
      owner: {
        connect: {
          id: ownerId,
        },
      },
      type,
      active,
      ...company,
    },
    update: {
      type,
      active,
      ...company,
    },
    where: {
      ownerId,
    },
  });
}

async function createMarketEvent() {
  await prisma.marketEvent.create({
    data: getFakeMarketEventData(),
  });
}

async function seed() {
  await createUser({ email: 'admin@example.com', isAdmin: true, name: faker.name.findName() });
  const florist1 = await createUser({ email: 'florist1@example.com', name: faker.name.findName() });
  const grower1 = await createUser({ email: 'grower1@example.com', name: faker.name.findName() });

  const floristCompany = getFakeCompanyData();
  await createApplication({ type: 'FLORIST', userId: florist1.id, company: floristCompany });
  await createCompany({ type: 'FLORIST', ownerId: florist1.id, active: false, company: floristCompany });

  const growerCompany = getFakeCompanyData();
  await createApplication({
    type: 'GROWER',
    userId: grower1.id,
    status: ApplicationStatus.APPROVED,
    company: growerCompany,
  });
  await createCompany({ type: 'GROWER', ownerId: grower1.id, active: true, company: growerCompany });

  await prisma.marketEvent.deleteMany();
  for (let i = 0; i < 10; i++) {
    await createMarketEvent();
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
