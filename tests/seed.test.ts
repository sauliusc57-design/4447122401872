import { db } from '@/db/client';
import { seedHolidayPlannerIfEmpty } from '@/db/seed';

jest.mock('@/db/auth', () => ({
  hashPassword: jest.fn().mockResolvedValue('mock_hash'),
}));

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
  },
}));

const mockDb = db as unknown as {
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
};

// Returns a chainable select result that supports both:
//   await db.select().from(x)          → directResult
//   await db.select().from(x).where(…) → whereResult
function makeSelect(directResult: unknown[], whereResult = directResult) {
  return {
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(whereResult),
      then: (
        resolve: (v: unknown[]) => unknown,
        reject?: (e: unknown) => unknown,
      ) => Promise.resolve(directResult).then(resolve, reject),
      catch: (reject: (e: unknown) => unknown) =>
        Promise.resolve(directResult).catch(reject),
    }),
  };
}

describe('seedHolidayPlannerIfEmpty', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('inserts sample data into all core tables when empty', async () => {
    mockDb.select
      // 1. select users where email = demo → no user
      .mockReturnValueOnce(makeSelect([], []))
      // 2. after insert, select users where email = demo → demoUser
      .mockReturnValueOnce(
        makeSelect([], [{ id: 1, email: 'demo@planner.com', passwordHash: 'mock_hash' }]),
      )
      // 3. select trips (no where) → empty
      .mockReturnValueOnce(makeSelect([]))
      // 4. select categories where userId = 1 → seeded categories
      .mockReturnValueOnce(
        makeSelect([], [
          { id: 1, name: 'City Break', userId: 1, color: '#4F46E5', icon: 'map' },
          { id: 2, name: 'Food Trip', userId: 1, color: '#F59E0B', icon: 'restaurant' },
          { id: 3, name: 'Adventure', userId: 1, color: '#10B981', icon: 'compass' },
          { id: 4, name: 'Relaxation', userId: 1, color: '#EC4899', icon: 'bed' },
        ]),
      )
      // 5. select trips where userId = 1 → seeded trips
      .mockReturnValueOnce(
        makeSelect([], [
          { id: 1, title: 'Weekend in Paris', userId: 1 },
          { id: 2, title: 'Summer in Rome', userId: 1 },
          { id: 3, title: 'Week in London', userId: 1 },
        ]),
      );

    const valuesMock = jest.fn().mockResolvedValue(undefined);
    mockDb.insert.mockReturnValue({ values: valuesMock });

    await seedHolidayPlannerIfEmpty();

    // inserts: users(0), categories(1), trips(2), activities(3), targets(4)
    expect(valuesMock).toHaveBeenCalledTimes(5);
    expect(valuesMock.mock.calls[1][0].length).toBeGreaterThan(0); // categories
    expect(valuesMock.mock.calls[2][0].length).toBeGreaterThan(0); // trips
    expect(valuesMock.mock.calls[3][0].length).toBeGreaterThan(0); // activities
    expect(valuesMock.mock.calls[4][0].length).toBeGreaterThan(0); // targets
  });

  it('does not insert duplicate data when tables already contain records', async () => {
    mockDb.select
      // user exists with matching hash → skip update
      .mockReturnValueOnce(
        makeSelect([], [{ id: 1, email: 'demo@planner.com', passwordHash: 'mock_hash' }]),
      )
      // trips exist → exit early
      .mockReturnValueOnce(makeSelect([{ id: 1 }]));

    await seedHolidayPlannerIfEmpty();

    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
