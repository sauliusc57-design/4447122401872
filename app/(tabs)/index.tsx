import TripCard from '@/components/TripCard';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, trips } from '@/db/schema';
import { seedHolidayPlannerIfEmpty } from '@/db/seed';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

const ALL_CATEGORIES = 'all';

function isFullIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default function IndexScreen() {
  const router = useRouter();

  const [tripRows, setTripRows] = useState<Trip[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadTrips = async () => {
        setLoading(true);
        await seedHolidayPlannerIfEmpty();

        const [tripData, categoryData] = await Promise.all([
          db.select().from(trips),
          db.select().from(categories),
        ]);

        if (active) {
          setTripRows(tripData);
          setCategoryRows(categoryData);
          setLoading(false);
        }
      };

      loadTrips();

      return () => {
        active = false;
      };
    }, [])
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const validFromDate = isFullIsoDate(fromDate.trim()) ? fromDate.trim() : '';
  const validToDate = isFullIsoDate(toDate.trim()) ? toDate.trim() : '';

  const filteredTrips = useMemo(() => {
    return tripRows.filter((trip) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        trip.title.toLowerCase().includes(normalizedQuery) ||
        trip.destination.toLowerCase().includes(normalizedQuery) ||
        (trip.notes ?? '').toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        selectedCategoryId === ALL_CATEGORIES ||
        String(trip.categoryId) === selectedCategoryId;

      const overlapsFromDate =
        validFromDate.length === 0 || trip.endDate >= validFromDate;

      const overlapsToDate =
        validToDate.length === 0 || trip.startDate <= validToDate;

      return matchesSearch && matchesCategory && overlapsFromDate && overlapsToDate;
    });
  }, [tripRows, normalizedQuery, selectedCategoryId, validFromDate, validToDate]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(ALL_CATEGORIES);
    setFromDate('');
    setToDate('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>My Trips</Text>
      <Text style={styles.subtitle}>
        {loading ? 'Loading trips...' : `${filteredTrips.length} of ${tripRows.length} trips shown`}
      </Text>

      <PrimaryButton label="Add Trip" onPress={() => router.push('/trip/add')} />

      {!loading && tripRows.length > 0 ? (
        <>
          <TextInput
            accessibilityLabel="Search trips"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setSearchQuery}
            placeholder="Search by title, destination, or notes"
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
          />

          <View style={styles.filterRow}>
            <Pressable
              accessibilityLabel="Filter by all categories"
              accessibilityRole="button"
              onPress={() => setSelectedCategoryId(ALL_CATEGORIES)}
              style={[
                styles.filterChip,
                selectedCategoryId === ALL_CATEGORIES && styles.filterChipSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategoryId === ALL_CATEGORIES && styles.filterChipTextSelected,
                ]}
              >
                All
              </Text>
            </Pressable>

            {categoryRows.map((category) => {
              const isSelected = selectedCategoryId === String(category.id);

              return (
                <Pressable
                  key={category.id}
                  accessibilityLabel={`Filter by ${category.name}`}
                  accessibilityRole="button"
                  onPress={() => setSelectedCategoryId(String(category.id))}
                  style={[
                    styles.filterChip,
                    isSelected && styles.filterChipSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.filterDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected && styles.filterChipTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From</Text>
              <TextInput
                accessibilityLabel="Filter trips from date"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                style={styles.dateInput}
                value={fromDate}
              />
            </View>

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To</Text>
              <TextInput
                accessibilityLabel="Filter trips to date"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#94A3B8"
                style={styles.dateInput}
                value={toDate}
              />
            </View>
          </View>

          <View style={styles.helperRow}>
            <Text style={styles.helperText}>
              Date filter shows trips that overlap the selected range.
            </Text>

            {(searchQuery.length > 0 ||
              selectedCategoryId !== ALL_CATEGORIES ||
              fromDate.length > 0 ||
              toDate.length > 0) && (
              <Pressable
                accessibilityLabel="Clear all trip filters"
                accessibilityRole="button"
                onPress={clearFilters}
              >
                <Text style={styles.clearText}>Clear filters</Text>
              </Pressable>
            )}
          </View>
        </>
      ) : null}

      {loading ? (
        <Text style={styles.message}>Loading trips...</Text>
      ) : tripRows.length === 0 ? (
        <Text style={styles.message}>No trips added yet.</Text>
      ) : filteredTrips.length === 0 ? (
        <Text style={styles.message}>No trips match your filters.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredTrips.map((trip) => {
            const category =
              trip.categoryId != null
                ? categoryRows.find((item) => item.id === trip.categoryId) ?? null
                : null;

            return <TripCard key={trip.id} trip={trip} category={category} />;
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 14,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 15,
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

filterRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 12,
  marginBottom: 4,
},

filterChip: {
  alignItems: 'center',
  alignSelf: 'flex-start',
  backgroundColor: '#F8FAFC',
  borderColor: '#94A3B8',
  borderRadius: 999,
  borderWidth: 1,
  flexDirection: 'row',
  marginRight: 8,
  marginBottom: 8,
  paddingHorizontal: 14,
  paddingVertical: 9,
},

filterChipSelected: {
  backgroundColor: '#0F172A',
  borderColor: '#0F172A',
},

filterChipText: {
  color: '#0F172A',
  fontSize: 14,
  fontWeight: '600',
},

filterChipTextSelected: {
  color: '#FFFFFF',
},

filterDot: {
  borderRadius: 999,
  height: 8,
  marginRight: 8,
  width: 8,
},

  dateRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    color: '#0F172A',
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  helperRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 2,
  },
  helperText: {
    color: '#64748B',
    flex: 1,
    fontSize: 12,
    marginRight: 12,
  },
  clearText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 12,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 16,
    textAlign: 'center',
  },
});