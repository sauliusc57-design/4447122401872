import CategoryPicker from '@/components/ui/category-picker';
import DatePickerField from '@/components/ui/date-picker-field';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { fetchUserCategories } from '@/db/queries';
import { activities, categories, trips } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseDateString, toDateString } from '@/lib/date-utils';
import { AuthContext, ToastContext } from '../../../../_layout';

type Activity = typeof activities.$inferSelect;
type Category = typeof categories.$inferSelect;
type Trip = typeof trips.$inferSelect;

export default function EditActivityScreen() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const [loading, setLoading] = useState(true);
  const [existingActivity, setExistingActivity] = useState<Activity | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);

  const [title, setTitle] = useState('');
  const [activityDate, setActivityDate] = useState<Date>(new Date());
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
        fetchUserCategories(currentUser.id),
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
      setActivityDate(parseDateString(foundActivity.activityDate));
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

    if (!title.trim() || !durationMinutes.trim()) {
      Alert.alert('Missing details', 'Please complete the title and duration.');
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
        activityDate: toDateString(activityDate),
        metricValue: parsedMinutes,
        metricType: 'minutes',
        status,
        notes: notes.trim() ? notes.trim() : null,
      })
      .where(eq(activities.id, existingActivity.id));

    toast?.showToast('Activity updated!');
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

        <DatePickerField label="Activity Date" value={activityDate} onChange={setActivityDate} />

        <FormField label="Duration (minutes)" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="120" keyboardType="numeric" />

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
    backgroundColor: '#FDF6EE',
  },
  content: {
    padding: 18,
  },
  title: {
    color: '#2C1F0E',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5C4A2E',
    fontSize: 15,
    marginBottom: 18,
  },
  label: {
    color: '#5C4A2E',
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
    backgroundColor: '#FFFAF4',
    borderColor: '#E8D5B7',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  chipSelected: {
    backgroundColor: '#E8873A',
    borderColor: '#E8873A',
  },
  chipText: {
    color: '#2C1F0E',
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
    color: '#5C4A2E',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 24,
  },
});
