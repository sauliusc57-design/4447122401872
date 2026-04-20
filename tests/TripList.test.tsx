import IndexScreen from '@/app/(tabs)/index';
import { AuthContext } from '@/app/_layout';
import { render, waitFor } from '@testing-library/react-native';

// Replace useFocusEffect with useEffect so the data-loading callback fires in tests.
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: require('react').useEffect,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  return { SafeAreaView: View };
});

jest.mock('@/db/seed', () => ({
  seedHolidayPlannerIfEmpty: jest.fn().mockResolvedValue(undefined),
}));

// Provide a plain context so both this test and the component import the same reference.
jest.mock('@/app/_layout', () => {
  const { createContext } = require('react');
  return { AuthContext: createContext(null) };
});

jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([
          {
            id: 1,
            title: 'Weekend in Paris',
            destination: 'Paris, France',
            startDate: '2026-06-10',
            endDate: '2026-06-12',
            notes: 'Seeded trip',
            userId: 1,
            categoryId: null,
            imageUri: null,
            createdAt: '2026-04-01T10:00:00.000Z',
          },
        ]),
      }),
    })),
  },
}));

describe('IndexScreen integration', () => {
  it('shows seeded trip data after database initialization', async () => {
    const { getByText } = render(
      <AuthContext.Provider
        value={{
          currentUser: { id: 1, email: 'test@test.com', passwordHash: '', createdAt: '' },
          setCurrentUser: jest.fn(),
        }}
      >
        <IndexScreen />
      </AuthContext.Provider>,
    );

    await waitFor(() => {
      expect(getByText('Weekend in Paris')).toBeTruthy();
    });
  });
});
