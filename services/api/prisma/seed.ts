import { PrismaClient } from '#prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
  log: ['warn', 'error'],
});

async function main() {
  console.log('User roles are already defined in the Prisma schema:');
  console.log('- EMPLOYEE');
  console.log('- ADMIN');
  console.log('No additional role seeding required.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
