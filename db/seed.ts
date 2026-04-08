import { db } from './client';
import { activities, categories, targets, trips, users } from './schema';
// If your file is actually named schemas.ts, change './schema' to './schemas'

export async function seedHolidayPlannerIfEmpty() {
  const existingTrips = await db.select().from(trips);

  console.log('existingTrips:', existingTrips);

  if (existingTrips.length > 0) {
    console.log('Seed skipped because trips already exist');
    return;
  }

  const now = new Date().toISOString();

  await db.insert(users).values([
    {
      email: 'demo@planner.com',
      passwordHash: 'demo123',
      createdAt: now,
    },
  ]);

  await db.insert(categories).values([
    {
      userId: 1,
      name: 'Sightseeing',
      color: '#4F46E5',
      icon: 'camera',
    },
    {
      userId: 1,
      name: 'Food',
      color: '#F59E0B',
      icon: 'restaurant',
    },
    {
      userId: 1,
      name: 'Transport',
      color: '#10B981',
      icon: 'bus',
    },
    {
      userId: 1,
      name: 'Relaxing',
      color: '#EC4899',
      icon: 'bed',
    },
  ]);

  await db.insert(trips).values([
    {
      userId: 1,
      title: 'Weekend in Paris',
      destination: 'Paris, France',
      startDate: '2026-06-12',
      endDate: '2026-06-15',
      notes: 'City break with museums and food spots',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: 1,
      title: 'Summer in Rome',
      destination: 'Rome, Italy',
      startDate: '2026-08-03',
      endDate: '2026-08-10',
      notes: 'Historic sites and local restaurants',
      imageUri: null,
      createdAt: now,
    },
  ]);

  await db.insert(activities).values([
    {
      tripId: 1,
      categoryId: 1,
      title: 'Visit Eiffel Tower',
      activityDate: '2026-06-13',
      metricValue: 120,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Book tickets in advance',
      createdAt: now,
    },
    {
      tripId: 1,
      categoryId: 2,
      title: 'Dinner by the Seine',
      activityDate: '2026-06-13',
      metricValue: 90,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Try a local bistro',
      createdAt: now,
    },
    {
      tripId: 1,
      categoryId: 3,
      title: 'Metro travel pass',
      activityDate: '2026-06-14',
      metricValue: 3,
      metricType: 'count',
      status: 'completed',
      notes: 'Use for museum hopping',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 1,
      title: 'Visit the Colosseum',
      activityDate: '2026-08-04',
      metricValue: 150,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Morning slot preferred',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 2,
      title: 'Pasta cooking class',
      activityDate: '2026-08-05',
      metricValue: 180,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Check group availability',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 4,
      title: 'Spa afternoon',
      activityDate: '2026-08-07',
      metricValue: 2,
      metricType: 'count',
      status: 'planned',
      notes: 'Hotel wellness centre',
      createdAt: now,
    },
  ]);

  await db.insert(targets).values([
    {
      userId: 1,
      tripId: 1,
      categoryId: 1,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 240,
      createdAt: now,
    },
    {
      userId: 1,
      tripId: 2,
      categoryId: 2,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 300,
      createdAt: now,
    },
  ]);
}