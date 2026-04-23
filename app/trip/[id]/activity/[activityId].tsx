// Activity detail screen. Displays all fields for a single activity with options to edit or delete it.
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext, ToastContext } from '../../../_layout';
import { darkColors, lightColors } from '@/constants/theme';

type Activity = typeof activities.$inferSelect;
type Category = typeof categories.$inferSelect;
type Trip = typeof trips.$inferSelect;

export default function ActivityDetailScreen() {
  const { activityId, id } = useLocalSearchParams<{ activityId: string; id: string }>();
  const router = useRouter();
  const toast = useContext(ToastContext);
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  const [activity, setActivity] = useState<Activity | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadActivity = async () => {
        if (!activityId) {
          if (active) setLoading(false);
          return;
        }

        setLoading(true);

        const activityRows = await db
          .select()
          .from(activities)
          .where(eq(activities.id, Number(activityId)));

        const foundActivity = activityRows[0] ?? null;

        if (!foundActivity) {
          if (active) {
            setActivity(null);
            setCategory(null);
            setTrip(null);
            setLoading(false);
          }
          return;
        }

        const [categoryRows, tripRows] = await Promise.all([
          db.select().from(categories).where(eq(categories.id, foundActivity.categoryId)),
          db.select().from(trips).where(eq(trips.id, foundActivity.tripId)),
        ]);

        if (active) {
          setActivity(foundActivity);
          setCategory(categoryRows[0] ?? null);
          setTrip(tripRows[0] ?? null);
          setLoading(false);
        }
      };

      loadActivity();

      return () => {
        active = false;
      };
    }, [activityId])
  );

  const deleteActivity = () => {
    if (!activity) return;

    Alert.alert('Delete Activity', `Delete "${activity.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(activities).where(eq(activities.id, activity.id));
          toast?.showToast('Activity deleted', 'delete');
          router.back();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>
        <Text style={[styles.message, { color: c.message }]}>Loading activity...</Text>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>
        <Text style={[styles.message, { color: c.message }]}>Activity not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>

        <Text style={[styles.title, { color: c.title }]}>{activity.title}</Text>
        <Text style={[styles.subtitle, { color: c.subtitle }]}>Activity details</Text>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Trip</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{trip ? trip.title : 'Unknown trip'}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Category</Text>
          <View style={styles.categoryRow}>
            <View
              style={[styles.categoryDot, { backgroundColor: category?.color ?? c.categoryDot }]}
            />
            <Text style={[styles.infoValue, { color: c.infoValue }]}>
              {category ? category.name : 'Unknown category'}
            </Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Date</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{activity.activityDate}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Duration</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{activity.metricValue} minutes</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Status</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{activity.status}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Notes</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>
            {activity.notes && activity.notes.trim().length > 0
              ? activity.notes
              : 'No notes added.'}
          </Text>
        </View>

        <PrimaryButton
          label="Edit Activity"
          onPress={() =>
            router.push({
              pathname: '/trip/[id]/activity/[activityId]/edit',
              params: { id, activityId: String(activity.id) },
            })
          }
        />

        <View style={styles.spacer} />

        <PrimaryButton label="Delete Activity" variant="danger" onPress={deleteActivity} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  infoBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    marginRight: 8,
  },
  spacer: {
    height: 10,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 24,
  },
});
