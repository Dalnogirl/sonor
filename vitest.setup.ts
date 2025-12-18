import '@testing-library/jest-dom';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

// Load DATABASE_URL from testcontainers temp file
const envPath = path.join(__dirname, '__tests__/setup/.test-env');
if (existsSync(envPath)) {
  process.env.DATABASE_URL = readFileSync(envPath, 'utf-8').trim();
}
