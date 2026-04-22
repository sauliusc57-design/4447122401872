import { defineConfig } from 'drizzle-kit';

// Drizzle Kit config — generates SQLite migrations targeting the Expo SQLite driver
export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  driver: 'expo',
});