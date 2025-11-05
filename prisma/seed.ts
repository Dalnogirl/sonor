import { PrismaClient } from '@prisma/client';
import { BcryptPasswordHasher } from '../src/infrastructure/services/BcryptPasswordHasher';

const prisma = new PrismaClient();
const passwordHasher = new BcryptPasswordHasher();

// Seed users with different roles/purposes for testing
const seedUsers = [
  {
    id: 'seed-user-1',
    email: 'admin@sonor.com',
    name: 'Admin User',
    password: 'Admin123!',
    isEmailVerified: true,
  },
  {
    id: 'seed-user-2',
    email: 'teacher@sonor.com',
    name: 'John Teacher',
    password: 'Teacher123!',
    isEmailVerified: true,
  },
  {
    id: 'seed-user-3',
    email: 'student@sonor.com',
    name: 'Jane Student',
    password: 'Student123!',
    isEmailVerified: true,
  },
  {
    id: 'seed-user-4',
    email: 'parent@sonor.com',
    name: 'Bob Parent',
    password: 'Parent123!',
    isEmailVerified: false,
  },
  {
    id: 'seed-user-5',
    email: 'test@sonor.com',
    name: 'Test User',
    password: 'Test123!',
    isEmailVerified: true,
  },
];

async function main() {
  console.log('🌱 Starting database seed...');

  for (const userData of seedUsers) {
    const { password, ...userWithoutPassword } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      console.log(`⏭️  User ${userData.email} already exists, skipping...`);
      continue;
    }

    // Hash password
    const hashedPassword = await passwordHasher.hash(password);

    // Create user
    await prisma.user.create({
      data: {
        ...userWithoutPassword,
        password: hashedPassword,
      },
    });

    console.log(`✅ Created user: ${userData.email} (password: ${password})`);
  }

  console.log('🎉 Database seed completed!');
}

main()
  .catch((error) => {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
