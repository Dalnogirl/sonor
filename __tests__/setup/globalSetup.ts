import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import path from 'path';

let container: StartedPostgreSqlContainer;

export default async function globalSetup() {
  console.log('\n🐳 Starting PostgreSQL container...');

  container = await new PostgreSqlContainer('postgres:16-alpine')
    .withDatabase('test_db')
    .withUsername('test')
    .withPassword('test')
    .start();

  const databaseUrl = container.getConnectionUri();

  // Write connection URL to temp file for test workers to read
  const envPath = path.join(__dirname, '.test-env');
  writeFileSync(envPath, databaseUrl);

  console.log(`✅ PostgreSQL container started`);

  // Run Prisma migrations
  console.log('🔄 Running Prisma migrations...');
  execSync(`npx prisma db push --skip-generate`, {
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: 'inherit',
  });

  console.log('✅ Database ready for tests\n');

  // Return teardown function
  return async () => {
    console.log('\n🛑 Stopping PostgreSQL container...');
    await container.stop();
    console.log('✅ PostgreSQL container stopped\n');
  };
}
