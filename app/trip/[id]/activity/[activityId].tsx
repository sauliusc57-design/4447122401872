// Activity detail screen. Displays all fields for a single activity with options to edit or delete it.
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, trips } from '@/db/schema';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToastContext } from '../../../_layout';

type Activity = typeof activities.$inferSelect;
type Category = typeof categories.$inferSelect;
type Trip = typeof trips.$inferSelect;

export default function ActivityDetailScreen() {
  const { activityId, id } = useLocalSearchParams<{ activityId: string; id: string }>();
  const router = useRouter();
  const toast = useContext(ToastContext);

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
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Loading activity...</Text>
      </SafeAreaView>
    );
  }

  if (!activity) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Activity not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.subtitle}>Activity details</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Trip</Text>
          <Text style={styles.infoValue}>{trip ? trip.title : 'Unknown trip'}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Category</Text>
          <View style={styles.categoryRow}>
            <View
              style={[styles.categoryDot, { backgroundColor: category?.color ?? '#E8D5B7' }]}
            />
            <Text style={styles.infoValue}>
              {category ? category.name : 'Unknown category'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Date</Text>
          <Text style={styles.infoValue}>{activity.activityDate}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Duration</Text>
          <Text style={styles.infoValue}>{activity.metricValue} minutes</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{activity.status}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Notes</Text>
          <Text style={styles.infoValue}>
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
    backgroundColor: '#FDF6EE',
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  title: {
    color: '#2C1F0E',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#5C4A2E',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#FFFAF4',
    borderColor: '#E8D5B7',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoLabel: {
    color: '#5C4A2E',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    color: '#2C1F0E',
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
    color: '#5C4A2E',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 24,
  },
});