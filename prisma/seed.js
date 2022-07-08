const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser({ email, isAdmin }) {
  const hashedPassword = await bcrypt.hash('password', 10);

  await prisma.user.upsert({
    create: {
      email,
      isAdmin,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
    update: {
      email,
      isAdmin,
    },
    where: {
      email,
    },
  });
}

async function seed() {
  await createUser({ email: 'user1@example.com' });
  await createUser({ email: 'admin@example.com', isAdmin: true });

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
