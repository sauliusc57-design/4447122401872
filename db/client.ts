import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('students.db');

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    major TEXT NOT NULL,
    year TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0
  );
`);

export const db = drizzle(sqlite);
