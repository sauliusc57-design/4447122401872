import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: text('created_at').notNull(),
});

export const trips = sqliteTable('trips', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  notes: text('notes'),
  imageUri: text('image_uri'), // add this
  createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  tripId: integer('trip_id').notNull(),
  categoryId: integer('category_id').notNull(),
  title: text('title').notNull(),
  activityDate: text('activity_date').notNull(),
  metricValue: integer('metric_value').notNull(),
  metricType: text('metric_type').notNull(),
  status: text('status').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const targets = sqliteTable('targets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  tripId: integer('trip_id'),
  categoryId: integer('category_id'),
  period: text('period').notNull(),
  metricType: text('metric_type').notNull(),
  targetValue: integer('target_value').notNull(),
  createdAt: text('created_at').notNull(),
});