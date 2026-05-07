import 'dotenv/config';
import path from 'node:path';
import type { PrismaConfig } from 'prisma';

export default {
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma', 'migrations'),
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig;
