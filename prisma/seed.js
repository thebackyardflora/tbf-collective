const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const any = require('@travi/any');
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

function getFakeApplicationData() {
  return {
    businessName: faker.company.companyName(),
    businessOwnerName: faker.name.findName(),
    einTin: faker.finance.bic(),
    website: faker.internet.url(),
    instagramHandle: faker.internet.userName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    businessAddress: faker.address.streetAddress(true),
    yearsInBusiness: faker.random.numeric(1),
  };
}

async function createApplication({ type, userId }) {
  await prisma.application.upsert({
    create: {
      userId,
      type,
      payloadJson: getFakeApplicationData(),
    },
    update: {
      userId,
      type,
      payloadJson: getFakeApplicationData(),
    },
    where: {
      userId,
    },
  });
}

async function seed() {
  await createUser({ email: 'admin@example.com', isAdmin: true, name: faker.name.findName() });
  const florist1 = await createUser({ email: 'florist1@example.com', name: faker.name.findName() });
  const grower1 = await createUser({ email: 'grower1@example.com', name: faker.name.findName() });

  await createApplication({ type: 'FLORIST', userId: florist1.id });
  await createApplication({ type: 'GROWER', userId: grower1.id });

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
