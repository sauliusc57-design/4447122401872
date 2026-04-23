// Seeds the database with a sample data
import { and, eq } from 'drizzle-orm';
import { hashPassword } from './auth';
import { db } from './client';
import { activities, categories, targets, tripPhotos, trips, users } from './schema';

export async function seedHolidayPlannerIfEmpty() {
  const now = new Date().toISOString();
  const demoEmail = 'demo@planner.com';
  const demoPasswordHash = await hashPassword('demo123');

  // Always ensure the demo user exists, even if seeding was previously skipped.
  let demoUser = (
    await db.select().from(users).where(eq(users.email, demoEmail))
  )[0];

  if (!demoUser) {
    await db.insert(users).values({
      email: demoEmail,
      passwordHash: demoPasswordHash,
      createdAt: now,
    });

    demoUser = (
      await db.select().from(users).where(eq(users.email, demoEmail))
    )[0];
  } else if (demoUser.passwordHash !== demoPasswordHash) {
    await db
      .update(users)
      .set({ passwordHash: demoPasswordHash })
      .where(eq(users.id, demoUser.id));

    demoUser = (
      await db.select().from(users).where(eq(users.email, demoEmail))
    )[0];
  }

  const existingTrips = await db.select().from(trips);

  if (existingTrips.length > 0) {
    return;
  }

  const demoUserId = demoUser.id;

  await db.insert(categories).values([
    {
      userId: demoUserId,
      name: 'City Break',
      color: '#4F46E5',
      icon: 'map',
    },
    {
      userId: demoUserId,
      name: 'Food Trip',
      color: '#F59E0B',
      icon: 'restaurant',
    },
    {
      userId: demoUserId,
      name: 'Adventure',
      color: '#10B981',
      icon: 'compass',
    },
    {
      userId: demoUserId,
      name: 'Relaxation',
      color: '#EC4899',
      icon: 'bed',
    },
  ]);

  const seededCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, demoUserId));

  const cityBreakCategory = seededCategories.find((item) => item.name === 'City Break');
  const foodTripCategory = seededCategories.find((item) => item.name === 'Food Trip');
  const adventureCategory = seededCategories.find((item) => item.name === 'Adventure');
  const relaxationCategory = seededCategories.find((item) => item.name === 'Relaxation');

  if (
    !cityBreakCategory ||
    !foodTripCategory ||
    !adventureCategory ||
    !relaxationCategory
  ) {
    throw new Error('Seed categories were not created correctly.');
  }

  await db.insert(trips).values([
    {
      userId: demoUserId,
      categoryId: cityBreakCategory.id,
      title: 'Weekend in Paris',
      destination: 'Paris, France',
      startDate: '2026-06-12',
      endDate: '2026-06-15',
      notes: 'City break with museums, river views and good food.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUserId,
      categoryId: foodTripCategory.id,
      title: 'Summer in Rome',
      destination: 'Rome, Italy',
      startDate: '2026-08-03',
      endDate: '2026-08-10',
      notes: 'Historic sites, cooking experiences and evening food tours.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUserId,
      categoryId: cityBreakCategory.id,
      title: 'Week in London',
      destination: 'London, England',
      startDate: '2026-09-05',
      endDate: '2026-09-11',
      notes: 'Museums, markets and a mix of indoor and outdoor plans.',
      imageUri: null,
      createdAt: now,
    },
  ]);

  const seededTrips = await db.select().from(trips).where(eq(trips.userId, demoUserId));

  const parisTrip = seededTrips.find((item) => item.title === 'Weekend in Paris');
  const romeTrip = seededTrips.find((item) => item.title === 'Summer in Rome');
  const londonTrip = seededTrips.find((item) => item.title === 'Week in London');

  if (!parisTrip || !romeTrip || !londonTrip) {
    throw new Error('Seed trips were not created correctly.');
  }

  await db.insert(activities).values([
    {
      tripId: parisTrip.id,
      categoryId: cityBreakCategory.id,
      title: 'Visit Eiffel Tower',
      activityDate: '2026-06-13',
      metricValue: 120,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Booked an early morning slot.',
      createdAt: now,
    },
    {
      tripId: parisTrip.id,
      categoryId: cityBreakCategory.id,
      title: 'Louvre highlights visit',
      activityDate: '2026-06-14',
      metricValue: 150,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Focused on the main galleries.',
      createdAt: now,
    },
    {
      tripId: parisTrip.id,
      categoryId: foodTripCategory.id,
      title: 'Dinner by the Seine',
      activityDate: '2026-06-13',
      metricValue: 90,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Try a local bistro with river views.',
      createdAt: now,
    },
    {
      tripId: parisTrip.id,
      categoryId: adventureCategory.id,
      title: 'Bike ride through central Paris',
      activityDate: '2026-06-14',
      metricValue: 75,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Short scenic ride between landmarks.',
      createdAt: now,
    },
    {
      tripId: romeTrip.id,
      categoryId: cityBreakCategory.id,
      title: 'Visit the Colosseum',
      activityDate: '2026-08-04',
      metricValue: 140,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Morning visit before the crowds.',
      createdAt: now,
    },
    {
      tripId: romeTrip.id,
      categoryId: foodTripCategory.id,
      title: 'Pasta cooking class',
      activityDate: '2026-08-05',
      metricValue: 180,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Hands-on class with a local chef.',
      createdAt: now,
    },
    {
      tripId: romeTrip.id,
      categoryId: foodTripCategory.id,
      title: 'Evening food tour',
      activityDate: '2026-08-06',
      metricValue: 120,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Several tasting stops included.',
      createdAt: now,
    },
    {
      tripId: romeTrip.id,
      categoryId: relaxationCategory.id,
      title: 'Spa afternoon',
      activityDate: '2026-08-07',
      metricValue: 90,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Hotel wellness centre booking.',
      createdAt: now,
    },
    {
      tripId: romeTrip.id,
      categoryId: cityBreakCategory.id,
      title: 'Roman Forum walk',
      activityDate: '2026-08-08',
      metricValue: 110,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Self-guided walk after lunch.',
      createdAt: now,
    },
    {
      tripId: londonTrip.id,
      categoryId: cityBreakCategory.id,
      title: 'British Museum visit',
      activityDate: '2026-09-06',
      metricValue: 150,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Start with the Egyptian galleries.',
      createdAt: now,
    },
    {
      tripId: londonTrip.id,
      categoryId: foodTripCategory.id,
      title: 'Borough Market lunch stop',
      activityDate: '2026-09-06',
      metricValue: 70,
      metricType: 'minutes',
      status: 'completed',
      notes: 'Plan time for dessert stalls.',
      createdAt: now,
    },
    {
      tripId: londonTrip.id,
      categoryId: adventureCategory.id,
      title: 'Hyde Park walk',
      activityDate: '2026-09-07',
      metricValue: 60,
      metricType: 'minutes',
      status: 'planned',
      notes: 'Easy afternoon walk.',
      createdAt: now,
    },
    {
      tripId: londonTrip.id,
      categoryId: relaxationCategory.id,
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
      userId: demoUserId,
      tripId: parisTrip.id,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 3,
      createdAt: now,
    },
    {
      userId: demoUserId,
      tripId: parisTrip.id,
      categoryId: cityBreakCategory.id,
      period: 'weekly',
      metricType: 'count',
      targetValue: 2,
      createdAt: now,
    },
    {
      userId: demoUserId,
      tripId: parisTrip.id,
      categoryId: foodTripCategory.id,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 90,
      createdAt: now,
    },
    {
      userId: demoUserId,
      tripId: romeTrip.id,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 4,
      createdAt: now,
    },
    {
      userId: demoUserId,
      tripId: romeTrip.id,
      categoryId: foodTripCategory.id,
      period: 'weekly',
      metricType: 'minutes',
      targetValue: 240,
      createdAt: now,
    },
    {
      userId: demoUserId,
      tripId: londonTrip.id,
      categoryId: null,
      period: 'weekly',
      metricType: 'count',
      targetValue: 3,
      createdAt: now,
    },
  ]);
}

export async function seedPastTripsAndPhotosIfEmpty() {
  const now = new Date().toISOString();
  const demoEmail = 'demo@planner.com';

  const demoUser = (await db.select().from(users).where(eq(users.email, demoEmail)))[0];
  if (!demoUser) return;

  const existingPastTrip = await db
    .select()
    .from(trips)
    .where(and(eq(trips.userId, demoUser.id), eq(trips.title, 'Spring in Paris')));
  if (existingPastTrip.length > 0) return;

  const userCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.userId, demoUser.id));

  const cityBreak = userCategories.find((c) => c.name === 'City Break');
  const foodTrip = userCategories.find((c) => c.name === 'Food Trip');
  const adventure = userCategories.find((c) => c.name === 'Adventure');

  if (!cityBreak || !foodTrip || !adventure) return;

  await db.insert(trips).values([
    {
      userId: demoUser.id,
      categoryId: cityBreak.id,
      title: 'Spring in Paris',
      destination: 'Paris, France',
      startDate: '2025-04-15',
      endDate: '2025-04-20',
      notes: 'Spring break exploring Montmartre, the Seine and classic Parisian cafés.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUser.id,
      categoryId: cityBreak.id,
      title: 'London City Break',
      destination: 'London, England',
      startDate: '2025-04-21',
      endDate: '2025-04-27',
      notes: 'A week of galleries, markets and walking the South Bank.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUser.id,
      categoryId: foodTrip.id,
      title: 'Roman Holiday',
      destination: 'Rome, Italy',
      startDate: '2025-02-10',
      endDate: '2025-02-17',
      notes: 'Off-season Rome — quiet streets, great food and no queues at the Vatican.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUser.id,
      categoryId: cityBreak.id,
      title: 'Barcelona Long Weekend',
      destination: 'Barcelona, Spain',
      startDate: '2025-05-09',
      endDate: '2025-05-13',
      notes: 'Gaudí architecture, tapas crawls and lazy afternoons on the beach.',
      imageUri: null,
      createdAt: now,
    },
    {
      userId: demoUser.id,
      categoryId: adventure.id,
      title: 'Berlin in June',
      destination: 'Berlin, Germany',
      startDate: '2025-06-06',
      endDate: '2025-06-12',
      notes: 'Street art, history and the best techno clubs in Europe.',
      imageUri: null,
      createdAt: now,
    },
  ]);

  const allUserTrips = await db.select().from(trips).where(eq(trips.userId, demoUser.id));
  const parisTrip = allUserTrips.find((t) => t.title === 'Spring in Paris');
  const londonTrip = allUserTrips.find((t) => t.title === 'London City Break');
  const romeTrip = allUserTrips.find((t) => t.title === 'Roman Holiday');
  const barcelonaTrip = allUserTrips.find((t) => t.title === 'Barcelona Long Weekend');
  const berlinTrip = allUserTrips.find((t) => t.title === 'Berlin in June');

  if (!parisTrip || !londonTrip || !romeTrip || !barcelonaTrip || !berlinTrip) return;

  await db.insert(tripPhotos).values([
    { tripId: parisTrip.id, uri: 'seeded:Paris_1', caption: null, createdAt: now },
    { tripId: parisTrip.id, uri: 'seeded:Paris_2', caption: null, createdAt: now },
    { tripId: parisTrip.id, uri: 'seeded:Paris_3', caption: null, createdAt: now },
    { tripId: londonTrip.id, uri: 'seeded:London_1', caption: null, createdAt: now },
    { tripId: londonTrip.id, uri: 'seeded:London_2', caption: null, createdAt: now },
    { tripId: londonTrip.id, uri: 'seeded:London_3', caption: null, createdAt: now },
    { tripId: romeTrip.id, uri: 'seeded:Rome_1', caption: null, createdAt: now },
    { tripId: romeTrip.id, uri: 'seeded:Rome_2', caption: null, createdAt: now },
    { tripId: romeTrip.id, uri: 'seeded:Rome_3', caption: null, createdAt: now },
    { tripId: barcelonaTrip.id, uri: 'seeded:Barcelona_1', caption: null, createdAt: now },
    { tripId: barcelonaTrip.id, uri: 'seeded:Barcelona_2', caption: null, createdAt: now },
    { tripId: barcelonaTrip.id, uri: 'seeded:Barcelona_3', caption: null, createdAt: now },
    { tripId: berlinTrip.id, uri: 'seeded:Berlin_1', caption: null, createdAt: now },
    { tripId: berlinTrip.id, uri: 'seeded:Berlin_2', caption: null, createdAt: now },
    { tripId: berlinTrip.id, uri: 'seeded:Berlin_3', caption: null, createdAt: now },
  ]);
}