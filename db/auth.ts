// Authentication helpers for registering, logging in, and deleting a user account.
// Passwords are hashed with SHA-256 via expo-crypto before being stored in SQLite.
// db/auth.ts
import { and, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { db } from './client';
import { activities, categories, targets, trips, users } from './schema';

export type User = typeof users.$inferSelect;

export async function hashPassword(password: string) {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password.trim()
  );
}

export async function registerUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email and password are required.');
  }

  const existingUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  if (existingUsers.length > 0) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(trimmedPassword);

  await db.insert(users).values({
    email: trimmedEmail,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const insertedUsers = await db
    .select()
    .from(users)
    .where(eq(users.email, trimmedEmail));

  return insertedUsers[0];
}

export async function loginUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    throw new Error('Email and password are required.');
  }

  const passwordHash = await hashPassword(trimmedPassword);

  const matchingUsers = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, trimmedEmail),
        eq(users.passwordHash, passwordHash)
      )
    );

  if (matchingUsers.length === 0) {
    throw new Error('Invalid email or password.');
  }

  return matchingUsers[0];
}

export async function deleteUserProfile(userId: number) {
  const userTrips = await db
    .select()
    .from(trips)
    .where(eq(trips.userId, userId));

  for (const trip of userTrips) {
    await db.delete(activities).where(eq(activities.tripId, trip.id));
  }

  await db.delete(targets).where(eq(targets.userId, userId));
  await db.delete(trips).where(eq(trips.userId, userId));
  await db.delete(categories).where(eq(categories.userId, userId));
  await db.delete(users).where(eq(users.id, userId));
}