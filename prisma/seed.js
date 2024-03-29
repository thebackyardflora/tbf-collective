require('dotenv').config();
const { PrismaClient, ApplicationStatus, InventoryListStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const algoliaSearch = require('algoliasearch');

const client = algoliaSearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);

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
    name: faker.company.name(),
    ownerName: faker.name.fullName(),
    einTin: faker.finance.bic(),
    email: faker.internet.email(),
    phone: faker.phone.number('208-5##-1###'),
  };
}

function getFakeAddressData() {
  return {
    street: faker.address.streetAddress(true),
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
  return await prisma.company.upsert({
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

function fakeCatalogItemData() {
  return {
    name: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    thumbnail: `https://picsum.photos/seed/${Math.floor(Math.random() * 1000) + 9000}/400/400`,
    basePrice: faker.datatype.number({ min: 1, max: 10, precision: 0.01 }),
  };
}

async function createCatalogItem({ createdById, withChildren }) {
  return await prisma.catalogItem.create({
    data: {
      createdBy: {
        connect: {
          id: createdById,
        },
      },
      ...fakeCatalogItemData(),
      children: withChildren
        ? {
            createMany: {
              data: Array(faker.datatype.number({ min: 1, max: 5 }))
                .fill(null)
                .map(() => ({
                  createdById,
                  ...fakeCatalogItemData(),
                })),
            },
          }
        : undefined,
    },
  });
}

async function createMarketEvent() {
  await prisma.marketEvent.create({
    data: getFakeMarketEventData(),
  });
}

async function createInventoryList({ companyId, marketId }) {
  const existingList = await prisma.inventoryList.findUnique({
    where: { marketEventId_companyId: { marketEventId: marketId, companyId } },
  });

  if (existingList) return;

  const catalogItems = await prisma.catalogItem.findMany({ where: { parentId: { not: null } } });

  const catalogItemIds = catalogItems.map((item) => item.id);

  const inventoryList = await prisma.inventoryList.create({
    data: {
      company: {
        connect: {
          id: companyId,
        },
      },
      marketEvent: {
        connect: {
          id: marketId,
        },
      },
      status: InventoryListStatus.APPROVED,
      inventoryRecords: {
        createMany: {
          data: catalogItemIds.map((catalogItemId) => ({
            catalogItemId,
            quantity: faker.datatype.number({ min: 20, max: 100 }),
            available: faker.datatype.number({ min: 20, max: 100 }),
            priceEach: faker.datatype.number({ min: 1, max: 10, precision: 0.01 }),
          })),
        },
      },
    },
    include: {
      inventoryRecords: {
        select: {
          catalogItem: true,
        },
      },
    },
  });

  // const index = client.initIndex('dev-market-inventory');
  // await index.clearObjects();
  // await index.saveObjects(
  //   inventoryList.inventoryRecords
  //     .map((record) => record.catalogItem)
  //     .map(({ id, ...item }) => ({
  //       ...item,
  //       objectID: id,
  //     }))
  // );
}

async function setupGrower({ index }) {
  const grower = await createUser({ email: `grower${index}@example.com`, name: faker.name.fullName() });

  const growerCompany = getFakeCompanyData();
  await createApplication({
    type: 'GROWER',
    userId: grower.id,
    status: ApplicationStatus.APPROVED,
    company: growerCompany,
  });
  const company = await createCompany({ type: 'GROWER', ownerId: grower.id, active: true, company: growerCompany });

  return [grower, company];
}

async function setupFlorist({ index }) {
  const florist = await createUser({ email: 'florist1@example.com', name: faker.name.fullName() });

  const floristCompany = getFakeCompanyData();
  await createApplication({
    type: 'FLORIST',
    userId: florist.id,
    status: ApplicationStatus.APPROVED,
    company: floristCompany,
  });
  const company = await createCompany({ type: 'FLORIST', ownerId: florist.id, active: true, company: floristCompany });

  return [florist, company];
}

async function setupCatalog({ adminId }) {
  const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

  await index.clearObjects();
  await prisma.catalogItem.deleteMany();
  const catalogItems = [];
  for (let i = 0; i < 10; i++) {
    catalogItems.push(await createCatalogItem({ createdById: adminId, withChildren: i % 2 === 0 }));
  }
  await index.saveObjects(catalogItems.map(({ id, ...item }) => ({ ...item, objectID: id })));

  return { catalogItems };
}

async function seed() {
  const admin = await createUser({ email: 'admin@example.com', isAdmin: true, name: faker.name.fullName() });
  await setupGrower({ index: 1 });
  const [, grower2Company] = await setupGrower({ index: 2 });
  await setupFlorist({ index: 1 });

  await prisma.marketEvent.deleteMany();
  await prisma.address.deleteMany();
  for (let i = 0; i < 10; i++) {
    await createMarketEvent();
  }

  const nextMarket = await prisma.marketEvent.findFirst({
    where: { marketDate: { gte: new Date() } },
    orderBy: { marketDate: 'asc' },
  });

  await setupCatalog({ adminId: admin.id });

  await createInventoryList({
    companyId: grower2Company.id,
    marketId: nextMarket.id,
  });

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
