import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  major: text('major').notNull(),
  year: text('year').notNull(),
  count: integer('count').notNull().default(0),
});