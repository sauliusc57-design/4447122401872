// Opens the SQLite database, creates all tables if they don't exist, and applies any
// schema migrations needed for older installs. Exports the Drizzle db client used across the app.
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

const sqlite = openDatabaseSync('holiday-planner-v4.db');

sqlite.execSync(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    notes TEXT,
    image_uri TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    activity_date TEXT NOT NULL,
    metric_value INTEGER NOT NULL,
    metric_type TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    trip_id INTEGER,
    category_id INTEGER,
    period TEXT NOT NULL,
    metric_type TEXT NOT NULL,
    target_value INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS trip_photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    trip_id INTEGER NOT NULL,
    uri TEXT NOT NULL,
    caption TEXT,
    created_at TEXT NOT NULL
  );
`);

// Migration: adds category_id to trips if it's missing (needed for installs created before that column was added).
const tripColumns = sqlite.getAllSync(`PRAGMA table_info(trips)`) as Array<{
  name: string;
}>;

const hasCategoryId = tripColumns.some((column) => column.name === 'category_id');

if (!hasCategoryId) {
  sqlite.execSync(`
    ALTER TABLE trips ADD COLUMN category_id INTEGER;
  `);
}

export const db = drizzle(sqlite);