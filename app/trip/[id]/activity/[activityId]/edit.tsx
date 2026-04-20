import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../../../_layout';

type Activity = typeof activities.$inferSelect;
type Category = typeof categories.$inferSelect;
type Trip = typeof trips.$inferSelect;

export default function EditActivityScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [existingActivity, setExistingActivity] = useState<Activity | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [status, setStatus] = useState<'planned' | 'completed'>('planned');
  const [notes, setNotes] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!auth?.currentUser) return null;

  const { currentUser } = auth;

  useEffect(() => {
    const loadActivity = async () => {
      if (!activityId) {
        setLoading(false);
        return;
      }

      const [activityRows, categoryList, userTrips] = await Promise.all([
        db.select().from(activities).where(eq(activities.id, Number(activityId))),
        db.select().from(categories).where(eq(categories.userId, currentUser.id)),
        db.select().from(trips).where(eq(trips.userId, currentUser.id)),
      ]);

      const foundActivity = activityRows[0] ?? null;
      const userTripIds = userTrips.map((trip: Trip) => trip.id);

      if (!foundActivity || !userTripIds.includes(foundActivity.tripId)) {
        setExistingActivity(null);
        setCategoryRows(categoryList);
        setLoading(false);
        return;
      }

      setExistingActivity(foundActivity);
      setCategoryRows(categoryList);
      setTitle(foundActivity.title);
      setActivityDate(foundActivity.activityDate);
      setDurationMinutes(String(foundActivity.metricValue));
      setStatus(foundActivity.status === 'completed' ? 'completed' : 'planned');
      setNotes(foundActivity.notes ?? '');
      setSelectedCategoryId(foundActivity.categoryId);

      setLoading(false);
    };

    loadActivity();
  }, [activityId, currentUser.id]);

  const saveActivity = async () => {
    if (!existingActivity) return;

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

    await db
      .update(activities)
      .set({
        categoryId: selectedCategoryId,
        title: title.trim(),
        activityDate: activityDate.trim(),
        metricValue: parsedMinutes,
        metricType: 'minutes',
        status,
        notes: notes.trim() ? notes.trim() : null,
      })
      .where(eq(activities.id, existingActivity.id));

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Loading activity...</Text>
      </SafeAreaView>
    );
  }

  if (!existingActivity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Activity not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Activity</Text>
        <Text style={styles.subtitle}>Update your saved activity.</Text>

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
          <PrimaryButton label="Save Changes" onPress={saveActivity} />
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