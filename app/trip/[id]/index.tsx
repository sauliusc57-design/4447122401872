import TargetProgressCard from '@/components/TargetProgressCard';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, targets, trips } from '@/db/schema';
import { calculateTargetProgress } from '@/lib/target-progress';
import { useFocusEffect } from '@react-navigation/native';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;
type Activity = typeof activities.$inferSelect;
type Target = typeof targets.$inferSelect;

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../../assets/images/trips/London.jpg'),
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [activityRows, setActivityRows] = useState<Activity[]>([]);
  const [targetRows, setTargetRows] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadTrip = async () => {
        if (!id) {
          if (active) setLoading(false);
          return;
        }

        setLoading(true);

        const [tripRows, allCategories, allActivities, allTargets] = await Promise.all([
          db.select().from(trips).where(eq(trips.id, Number(id))),
          db.select().from(categories),
          db.select().from(activities),
          db.select().from(targets).where(eq(targets.tripId, Number(id))),
        ]);

        const foundTrip = tripRows[0] ?? null;
        const foundCategory =
          foundTrip?.categoryId != null
            ? allCategories.find((item) => item.id === foundTrip.categoryId) ?? null
            : null;

        if (active) {
          setTrip(foundTrip);
          setCategory(foundCategory);
          setCategoryRows(allCategories);
          setActivityRows(allActivities);
          setTargetRows(allTargets);
          setLoading(false);
        }
      };

      loadTrip();

      return () => {
        active = false;
      };
    }, [id])
  );

  const deleteTrip = () => {
    if (!trip) return;

    Alert.alert('Delete Trip', `Are you sure you want to delete "${trip.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(trips).where(eq(trips.id, trip.id));
          router.back();
        },
      },
    ]);
  };

  const deleteTarget = (target: Target) => {
    Alert.alert('Delete Target', 'Are you sure you want to delete this target?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(targets).where(eq(targets.id, target.id));

          const refreshedTargets = await db
            .select()
            .from(targets)
            .where(eq(targets.tripId, Number(id)));

          setTargetRows(refreshedTargets);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContent}>
          <Text style={styles.message}>Trip not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fallbackImage = seededImages[trip.title];
  const hasImage = typeof trip.imageUri === 'string' && trip.imageUri.trim().length > 0;

  const tripActivities = activityRows.filter((activity) => activity.tripId === trip.id);

  const completedActivities = tripActivities.filter(
    (activity) => activity.status === 'completed'
  );

  const progressItems = targetRows.map((target) =>
    calculateTargetProgress({
      trip,
      target,
      activities: activityRows,
      categories: categoryRows,
    })
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {hasImage ? (
          <Image source={{ uri: trip.imageUri! }} style={styles.image} resizeMode="cover" />
        ) : fallbackImage ? (
          <Image source={fallbackImage} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.title}>{trip.title}</Text>
        <Text style={styles.destination}>{trip.destination}</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Category</Text>
          <View style={styles.categoryRow}>
            <View
              style={[styles.categoryDot, { backgroundColor: category?.color ?? '#CBD5E1' }]}
            />
            <Text style={styles.infoValue}>
              {category ? category.name : 'No category assigned'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Start Date</Text>
          <Text style={styles.infoValue}>{trip.startDate}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>End Date</Text>
          <Text style={styles.infoValue}>{trip.endDate}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Notes</Text>
          <Text style={styles.infoValue}>
            {trip.notes && trip.notes.trim().length > 0 ? trip.notes : 'No notes added.'}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Activity Summary</Text>
          <Text style={styles.infoValue}>
            {tripActivities.length} activities · {completedActivities.length} completed
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Activities</Text>
            <Text style={styles.sectionSubtitle}>
              Add, open and manage activities for this trip.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Add Activity"
          onPress={() =>
            router.push({
              pathname: '/trip/[id]/activity/add',
              params: { id: String(trip.id) },
            })
          }
        />

        <View style={styles.sectionSpacer} />

        {tripActivities.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptyText}>
              Add your first activity for this trip to start tracking records.
            </Text>
          </View>
        ) : (
          tripActivities.map((activity) => {
            const activityCategory =
              categoryRows.find((item) => item.id === activity.categoryId) ?? null;

            return (
              <Pressable
                key={activity.id}
                accessibilityRole="button"
                accessibilityLabel={`${activity.title}, open activity details`}
                onPress={() =>
                  router.push({
                    pathname: '/trip/[id]/activity/[activityId]',
                    params: { id: String(trip.id), activityId: String(activity.id) },
                  })
                }
                style={({ pressed }) => [styles.activityCard, pressed && styles.activityCardPressed]}>
                <View style={styles.activityTopRow}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDate}>{activity.activityDate}</Text>
                </View>

                <View style={styles.activityMetaRow}>
                  <View style={styles.activityMetaPill}>
                    <Text style={styles.activityMetaText}>
                      {activityCategory ? activityCategory.name : 'Unknown category'}
                    </Text>
                  </View>

                  <View style={styles.activityMetaPill}>
                    <Text style={styles.activityMetaText}>
                      {activity.metricValue} minutes
                    </Text>
                  </View>

                  <View style={styles.activityMetaPill}>
                    <Text style={styles.activityMetaText}>{activity.status}</Text>
                  </View>
                </View>

                <Text style={styles.activityNotes}>
                  {activity.notes && activity.notes.trim().length > 0
                    ? activity.notes
                    : 'No notes added.'}
                </Text>
              </Pressable>
            );
          })
        )}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Targets</Text>
            <Text style={styles.sectionSubtitle}>
              Progress is based on completed activities only.
            </Text>
          </View>
        </View>

        <PrimaryButton
          label="Add Target"
          onPress={() =>
            router.push({
              pathname: '/trip/[id]/target/add',
              params: { id: String(trip.id) },
            })
          }
        />

        <View style={styles.sectionSpacer} />

        {progressItems.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No targets yet</Text>
            <Text style={styles.emptyText}>
              Add a weekly or monthly target for this trip or for a specific activity category.
            </Text>
          </View>
        ) : (
          progressItems.map((item) => (
            <TargetProgressCard
              key={item.target.id}
              item={item}
              onEdit={() =>
                router.push({
                  pathname: '/trip/[id]/target/[targetId]/edit',
                  params: {
                    id: String(trip.id),
                    targetId: String(item.target.id),
                  },
                })
              }
              onDelete={() => deleteTarget(item.target)}
            />
          ))
        )}

        <View style={styles.sectionSpacer} />

        <PrimaryButton
          label="Edit Trip"
          onPress={() =>
            router.push({
              pathname: '/trip/[id]/edit',
              params: { id: String(trip.id) },
            })
          }
        />

        <View style={styles.spacer} />

        <PrimaryButton label="Delete Trip" variant="danger" onPress={deleteTrip} />
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
    paddingBottom: 28,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  image: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 14,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
  },
  destination: {
    color: '#475569',
    fontSize: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  infoLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    color: '#0F172A',
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
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  sectionSpacer: {
    height: 12,
  },
  spacer: {
    height: 10,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  activityCardPressed: {
    opacity: 0.9,
  },
  activityTopRow: {
    marginBottom: 10,
  },
  activityTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '700',
  },
  activityDate: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  activityMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  activityMetaPill: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  activityMetaText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '500',
  },
  activityNotes: {
    color: '#475569',
    fontSize: 14,
    lineHeight: 20,
  },
});