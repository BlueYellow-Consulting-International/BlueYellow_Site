// Idempotent admin bootstrap — plain .mjs so `prisma db seed` needs no TS runner.
// Credentials come from apps/api/.env: ADMIN_EMAIL / ADMIN_PASSWORD.

import bcrypt from 'bcryptjs';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;

const prisma = new PrismaClient();

const email = (process.env.ADMIN_EMAIL ?? 'admin@blueyellow.test').trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? 'admin123-change-me';

async function main() {
  const existing = await prisma.user.findFirst({ where: { email } });

  const passwordHash = await bcrypt.hash(password, 10);

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { role: 'admin', passwordHash },
    });
    console.log(`Admin refreshed: ${email}`);
    return;
  }

  await prisma.user.create({
    data: { email, passwordHash, role: 'admin' },
  });

  console.log(`Admin created: ${email}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
