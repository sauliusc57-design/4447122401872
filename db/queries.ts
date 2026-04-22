import { eq } from 'drizzle-orm';
import { db } from './client';
import { categories } from './schema';

// Fetch all categories belonging to the given user
export function fetchUserCategories(userId: number) {
  return db.select().from(categories).where(eq(categories.userId, userId));
}
