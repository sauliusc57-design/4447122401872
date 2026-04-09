// db/seed.ts
import { db } from './client';
import { activities, categories, targets, trips, users } from './schema';

export async function seedHolidayPlannerIfEmpty() {
  const existingTrips = await db.select().from(trips);

  if (existingTrips.length > 0) {
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
      name: 'City Break',
      color: '#4F46E5',
      icon: 'map',
    },
    {
      userId: 1,
      name: 'Food Trip',
      color: '#F59E0B',
      icon: 'restaurant',
    },
    {
      userId: 1,
      name: 'Adventure',
      color: '#10B981',
      icon: 'compass',
    },
    {
      userId: 1,
      name: 'Relaxation',
      color: '#EC4899',
      icon: 'bed',
    },
  ]);

  await db.insert(trips).values([
    {
      userId: 1,
      categoryId: 1,
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
      categoryId: 2,
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
      status: 'completed',
      notes: 'Booked morning slot',
      createdAt: now,
    },
    {
      tripId: 1,
      categoryId: 1,
      title: 'Louvre visit',
      activityDate: '2026-06-14',
      metricValue: 90,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Focused on main highlights',
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
      notes: 'Used around the city',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 1,
      title: 'Visit the Colosseum',
      activityDate: '2026-08-04',
      metricValue: 150,
      metricType: 'minutes',
      status: 'completed',
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
      status: 'completed',
      notes: 'Excellent local chef',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 2,
      title: 'Evening food tour',
      activityDate: '2026-08-06',
      metricValue: 120,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Multiple tastings included',
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
      tripId: 1,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 4,
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
    {
      userId: 1,
      tripId: 2,
      categoryId: null,
      period: 'monthly',
      metricType: 'minutes',
      targetValue: 600,
      createdAt: now,
    },
  ]);
}