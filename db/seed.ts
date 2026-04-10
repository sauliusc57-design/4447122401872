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
      notes: 'City break with museums, river views and good food.',
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
      notes: 'Historic sites, cooking experiences and evening food tours.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: 1,
      categoryId: 1,
      title: 'Week in London',
      destination: 'London, England',
      startDate: '2026-09-05',
      endDate: '2026-09-11',
      notes: 'Museums, markets and a mix of indoor and outdoor plans.',
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
      notes: 'Booked an early morning slot.',
      createdAt: now,
    },
    {
      tripId: 1,
      categoryId: 1,
      title: 'Louvre highlights visit',
      activityDate: '2026-06-14',
      metricValue: 150,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Focused on the main galleries.',
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
      notes: 'Try a local bistro with river views.',
      createdAt: now,
    },
    {
      tripId: 1,
      categoryId: 3,
      title: 'Bike ride through central Paris',
      activityDate: '2026-06-14',
      metricValue: 75,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Short scenic ride between landmarks.',
      createdAt: now,
    },

    {
      tripId: 2,
      categoryId: 1,
      title: 'Visit the Colosseum',
      activityDate: '2026-08-04',
      metricValue: 140,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Morning visit before the crowds.',
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
      notes: 'Hands-on class with a local chef.',
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
      notes: 'Several tasting stops included.',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 4,
      title: 'Spa afternoon',
      activityDate: '2026-08-07',
      metricValue: 90,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Hotel wellness centre booking.',
      createdAt: now,
    },
    {
      tripId: 2,
      categoryId: 1,
      title: 'Roman Forum walk',
      activityDate: '2026-08-08',
      metricValue: 110,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Self-guided walk after lunch.',
      createdAt: now,
    },

    {
      tripId: 3,
      categoryId: 1,
      title: 'British Museum visit',
      activityDate: '2026-09-06',
      metricValue: 150,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Start with the Egyptian galleries.',
      createdAt: now,
    },
    {
      tripId: 3,
      categoryId: 2,
      title: 'Borough Market lunch stop',
      activityDate: '2026-09-06',
      metricValue: 70,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Plan time for dessert stalls.',
      createdAt: now,
    },
    {
      tripId: 3,
      categoryId: 3,
      title: 'Hyde Park walk',
      activityDate: '2026-09-07',
      metricValue: 60,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Easy afternoon walk.',
      createdAt: now,
    },
    {
      tripId: 3,
      categoryId: 4,
      title: 'West End evening show',
      activityDate: '2026-09-08',
      metricValue: 140,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Book tickets in advance.',
      createdAt: now,
    },
  ]);

  await db.insert(targets).values([
    {
      userId: 1,
      tripId: 1,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 3,
      createdAt: now,
    },
    {
      userId: 1,
      tripId: 1,
      categoryId: 1,
      period: 'weekly',
      metricType: 'count',
      targetValue: 2,
      createdAt: now,
    },
    {
      userId: 1,
      tripId: 1,
      categoryId: 2,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 90,
      createdAt: now,
    },

    {
      userId: 1,
      tripId: 2,
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
      categoryId: 1,
      period: 'weekly',
      metricType: 'count',
      targetValue: 2,
      createdAt: now,
    },

    {
      userId: 1,
      tripId: 3,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 3,
      createdAt: now,
    },
    {
      userId: 1,
      tripId: 3,
      categoryId: 1,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 120,
      createdAt: now,
    },
  ]);
}