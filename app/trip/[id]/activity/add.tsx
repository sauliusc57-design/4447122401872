import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../_layout';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

export default function AddActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [status, setStatus] = useState<'planned' | 'completed'>('planned');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!auth?.currentUser) return null;

  const { currentUser } = auth;

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const [tripRows, categoryList] = await Promise.all([
        db
          .select()
          .from(trips)
          .where(and(eq(trips.id, Number(id)), eq(trips.userId, currentUser.id))),
        db.select().from(categories).where(eq(categories.userId, currentUser.id)),
      ]);

      const foundTrip = tripRows[0] ?? null;

      setTrip(foundTrip);
      setCategoryRows(categoryList);

      if (categoryList.length > 0) {
        setSelectedCategoryId(categoryList[0].id);
      }

      if (foundTrip) {
        setActivityDate(foundTrip.startDate);
      }

      setLoading(false);
    };

    loadData();
  }, [id, currentUser.id]);

  const saveActivity = async () => {
    if (!trip) return;

    if (!title.trim() || !activityDate.trim() || !durationMinutes.trim()) {
      Alert.alert('Missing details', 'Please complete the title, date, and duration.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Missing category', 'Please select a category for the activity.');
      return;
    }

    const parsedMinutes = Number(durationMinutes);

    if (!Number.isInteger(parsedMinutes) || parsedMinutes <= 0) {
      Alert.alert('Invalid duration', 'Please enter a whole number greater than zero.');
      return;
    }

    await db.insert(activities).values({
      tripId: trip.id,
      categoryId: selectedCategoryId,
      title: title.trim(),
      activityDate: activityDate.trim(),
      metricValue: parsedMinutes,
      metricType: 'minutes',
      status,
      notes: notes.trim() ? notes.trim() : null,
      createdAt: new Date().toISOString(),
    });

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Loading trip...</Text>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Trip not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Activity</Text>
        <Text style={styles.subtitle}>Create a new activity for {trip.title}.</Text>

        <CategoryPicker
          categories={categoryRows}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          label="Activity Category"
        />

        <FormField label="Activity Title" value={title} onChangeText={setTitle} placeholder="Visit Eiffel Tower" />
        <FormField label="Activity Date" value={activityDate} onChangeText={setActivityDate} placeholder="2026-06-13" />
        <FormField label="Duration (minutes)" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="120" />

        <Text style={styles.label}>Status</Text>
        <View style={styles.chipRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select planned status"
            onPress={() => setStatus('planned')}
            style={[styles.chip, status === 'planned' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, status === 'planned' && styles.chipTextSelected]}>
              Planned
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select completed status"
            onPress={() => setStatus('completed')}
            style={[styles.chip, status === 'completed' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, status === 'completed' && styles.chipTextSelected]}>
              Completed
            </Text>
          </Pressable>
        </View>

        <FormField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional activity notes"
          multiline
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Save Activity" onPress={saveActivity} />
          <View style={styles.spacer} />
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 18,
  },
  label: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: '#FFFFFF',
    borderColor: '#94A3B8',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 24,
  },
});