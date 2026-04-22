import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories } from './schema';

export function fetchUserCategories(userId: number) {
  return db.select().from(categories).where(eq(categories.userId, userId));
}
