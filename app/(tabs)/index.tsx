// Main trips list screen. Loads the logged-in user's trips and categories from SQLite,
// and lets them filter by text search, category, and a single date.
import TripCard from '@/components/TripCard';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, trips } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

const ALL_CATEGORIES = 'all';

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatDisplay(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function IndexScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const currentUser = auth?.currentUser ?? null;

  const [tripRows, setTripRows] = useState<Trip[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(ALL_CATEGORIES);
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [iosPickerVisible, setIosPickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;

      let active = true;

      const loadTrips = async () => {
        setLoading(true);

        const [tripData, categoryData] = await Promise.all([
          db.select().from(trips).where(eq(trips.userId, currentUser.id)),
          db.select().from(categories).where(eq(categories.userId, currentUser.id)),
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
    }, [currentUser])
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

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

      const matchesDate =
        filterDate === null ||
        (trip.startDate <= toDateString(filterDate) && trip.endDate >= toDateString(filterDate));

      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [tripRows, normalizedQuery, selectedCategoryId, filterDate]);

  if (!currentUser) return null;

  const openDatePicker = () => {
    const current = filterDate ?? new Date();
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'date',
        onChange: (_e, date) => {
          if (date) setFilterDate(date);
        },
      });
    } else {
      setIosPickerVisible(true);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryId(ALL_CATEGORIES);
    setFilterDate(null);
  };

  const hasActiveFilters =
    searchQuery.length > 0 ||
    selectedCategoryId !== ALL_CATEGORIES ||
    filterDate !== null;

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
                  style={[styles.filterChip, isSelected && styles.filterChipSelected]}
                >
                  <View style={[styles.filterDot, { backgroundColor: category.color }]} />
                  <Text
                    style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}
                    numberOfLines={1}
                  >
                    {category.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Date</Text>
            <Pressable
              accessibilityLabel="Filter trips by date"
              accessibilityRole="button"
              onPress={openDatePicker}
              style={styles.datePicker}
            >
              <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.calendarIcon} />
              <Text style={[styles.datePickerText, !filterDate && styles.datePickerPlaceholder]}>
                {filterDate ? formatDisplay(filterDate) : 'Select a date'}
              </Text>
              {filterDate && (
                <Pressable
                  accessibilityLabel="Clear date filter"
                  onPress={() => setFilterDate(null)}
                  hitSlop={8}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </Pressable>
              )}
            </Pressable>
          </View>

          {hasActiveFilters && (
            <View style={styles.helperRow}>
              <Pressable
                accessibilityLabel="Clear all trip filters"
                accessibilityRole="button"
                onPress={clearFilters}
              >
                <Text style={styles.clearText}>Clear filters</Text>
              </Pressable>
            </View>
          )}
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

      {Platform.OS === 'ios' && (
        <Modal visible={iosPickerVisible} transparent animationType="slide">
          <View style={styles.iosOverlay}>
            <View style={styles.iosSheet}>
              <Pressable
                onPress={() => setIosPickerVisible(false)}
                style={styles.iosDoneRow}
              >
                <Text style={styles.iosDoneText}>Done</Text>
              </Pressable>
              <DateTimePicker
                value={filterDate ?? new Date()}
                mode="date"
                display="spinner"
                onChange={(_e, date) => {
                  if (date) setFilterDate(date);
                }}
              />
            </View>
          </View>
        </Modal>
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
    marginTop: 4,
    marginBottom: 4,
  },
  dateLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  calendarIcon: {
    marginRight: 8,
  },
  datePickerText: {
    flex: 1,
    color: '#0F172A',
    fontSize: 15,
  },
  datePickerPlaceholder: {
    color: '#94A3B8',
  },
  helperRow: {
    alignItems: 'flex-end',
    marginTop: 8,
    marginBottom: 2,
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
  iosOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  iosSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  iosDoneRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: 1,
  },
  iosDoneText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
});
