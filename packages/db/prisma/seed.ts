import 'dotenv/config';
import { config } from 'dotenv';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import argon2 from 'argon2';

config({ path: '../../.env' });

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding development users...');

  const defaultPasswordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  const seedUsers = [
    {
      email: 'admin@dealflow360.com',
      name: 'System Admin',
      role: Role.ADMIN,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'sales.manager@dealflow360.com',
      name: 'Sarah Manager',
      role: Role.SALES_MANAGER,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'sales.rep@dealflow360.com',
      name: 'Bob Salesrep',
      role: Role.SALES_REP,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'finance@dealflow360.com',
      name: 'Frank Finance',
      role: Role.FINANCE_OPERATIONS,
      passwordHash: defaultPasswordHash,
    },
    {
      email: 'customer@dealflow360.com',
      name: 'Acme Procurement',
      role: Role.CUSTOMER,
      passwordHash: defaultPasswordHash,
    },
  ];

  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        passwordHash: user.passwordHash,
      },
      create: user,
    });
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  console.log('Database seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
