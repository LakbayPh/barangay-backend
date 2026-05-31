import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserRole } from '@prisma/client';
import { SensitiveDataService } from '../src/common/security/sensitive-data.service';

const PASSWORD_SALT_ROUNDS = 12;
const MIN_ADMIN_PASSWORD_LENGTH = 8;

async function main(): Promise<void> {
  const email = process.env.FIRST_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.FIRST_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'FIRST_ADMIN_EMAIL and FIRST_ADMIN_PASSWORD are required to seed an admin account',
    );
  }

  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    throw new Error(
      `FIRST_ADMIN_PASSWORD must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`,
    );
  }

  const config = new ConfigService();
  const sensitiveData = new SensitiveDataService(config);
  const emailHash = sensitiveData.createLookupHash(email);
  const adapter = new PrismaPg({
    connectionString: config.getOrThrow<string>('DATABASE_URL'),
  });
  const prisma = new PrismaClient({ adapter });

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        emailHash,
      },
      select: {
        role: true,
      },
    });

    if (existingUser) {
      if (existingUser.role === UserRole.ADMIN) {
        console.log('Admin account already exists.');
        return;
      }

      throw new Error(
        'An account with this email already exists but is not an admin.',
      );
    }

    await prisma.user.create({
      data: {
        emailEncrypted: sensitiveData.encrypt(email),
        emailHash,
        passwordHash: await bcrypt.hash(password, PASSWORD_SALT_ROUNDS),
        role: UserRole.ADMIN,
      },
    });

    console.log('Admin account created.');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
