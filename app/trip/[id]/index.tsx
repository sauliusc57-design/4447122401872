import TargetProgressCard from '@/components/TargetProgressCard';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { activities, categories, targets, trips } from '@/db/schema';
import { calculateTargetProgress } from '@/lib/target-progress';
import { useFocusEffect } from '@react-navigation/native';
import { and, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useContext, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext, ThemeContext } from '../../_layout';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;
type Activity = typeof activities.$inferSelect;
type Target = typeof targets.$inferSelect;

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../../assets/images/trips/London.jpg'),
};

const lightColors = {
  background: '#F8FAFC',
  title: '#0F172A',
  destination: '#475569',
  message: '#475569',
  card: '#FFFFFF',
  border: '#CBD5E1',
  infoLabel: '#475569',
  infoValue: '#0F172A',
  sectionTitle: '#0F172A',
  sectionSubtitle: '#64748B',
  emptyTitle: '#0F172A',
  emptyText: '#475569',
  cardTitle: '#0F172A',
  cardDate: '#475569',
  cardNotes: '#475569',
  metaPillBg: '#F8FAFC',
  metaPillText: '#0F172A',
  placeholderBg: '#E2E8F0',
  placeholderText: '#64748B',
};

const darkColors = {
  background: '#0F172A',
  title: '#F1F5F9',
  destination: '#94A3B8',
  message: '#94A3B8',
  card: '#1E293B',
  border: '#334155',
  infoLabel: '#94A3B8',
  infoValue: '#F1F5F9',
  sectionTitle: '#F1F5F9',
  sectionSubtitle: '#94A3B8',
  emptyTitle: '#F1F5F9',
  emptyText: '#94A3B8',
  cardTitle: '#F1F5F9',
  cardDate: '#94A3B8',
  cardNotes: '#94A3B8',
  metaPillBg: '#0F172A',
  metaPillText: '#F1F5F9',
  placeholderBg: '#1E293B',
  placeholderText: '#64748B',
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);
  const themeCtx = useContext(ThemeContext);

  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [activityRows, setActivityRows] = useState<Activity[]>([]);
  const [targetRows, setTargetRows] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = auth?.currentUser ?? null;

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadTrip = async () => {
        if (!id || !currentUser) {
          if (active) setLoading(false);
          return;
        }

        setLoading(true);

        const [tripRows, userCategories, allActivities, userTargets] = await Promise.all([
          db
            .select()
            .from(trips)
            .where(and(eq(trips.id, Number(id)), eq(trips.userId, currentUser.id))),
          db.select().from(categories).where(eq(categories.userId, currentUser.id)),
          db.select().from(activities),
          db
            .select()
            .from(targets)
            .where(and(eq(targets.tripId, Number(id)), eq(targets.userId, currentUser.id))),
        ]);

        const foundTrip = tripRows[0] ?? null;

        const foundCategory =
          foundTrip?.categoryId != null
            ? userCategories.find((item) => item.id === foundTrip.categoryId) ?? null
            : null;

        const filteredActivities = foundTrip
          ? allActivities.filter((activity) => activity.tripId === foundTrip.id)
          : [];

        if (active) {
          setTrip(foundTrip);
          setCategory(foundCategory);
          setCategoryRows(userCategories);
          setActivityRows(filteredActivities);
          setTargetRows(userTargets);
          setLoading(false);
        }
      };

      loadTrip();

      return () => {
        active = false;
      };
    }, [id, currentUser])
  );

  const deleteTrip = () => {
    if (!trip) return;

    Alert.alert('Delete Trip', `Are you sure you want to delete "${trip.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(activities).where(eq(activities.tripId, trip.id));
          await db.delete(targets).where(eq(targets.tripId, trip.id));
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
            .where(and(eq(targets.tripId, Number(id)), eq(targets.userId, currentUser!.id)));

          setTargetRows(refreshedTargets);
        },
      },
    ]);
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.message, { color: c.message }]}>Loading trip...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.message, { color: c.message }]}>Trip not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const fallbackImage = seededImages[trip.title];
  const hasImage = typeof trip.imageUri === 'string' && trip.imageUri.trim().length > 0;

  const completedActivities = activityRows.filter((activity) => activity.status === 'completed');

  const progressItems = targetRows.map((target) =>
    calculateTargetProgress({
      trip,
      target,
      activities: activityRows,
      categories: categoryRows,
    })
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {hasImage ? (
          <Image source={{ uri: trip.imageUri! }} style={styles.image} resizeMode="cover" />
        ) : fallbackImage ? (
          <Image source={fallbackImage} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: c.placeholderBg }]}>
            <Text style={[styles.placeholderText, { color: c.placeholderText }]}>No Image</Text>
          </View>
        )}

        <Text style={[styles.title, { color: c.title }]}>{trip.title}</Text>
        <Text style={[styles.destination, { color: c.destination }]}>{trip.destination}</Text>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Category</Text>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: category?.color ?? '#CBD5E1' }]} />
            <Text style={[styles.infoValue, { color: c.infoValue }]}>{category ? category.name : 'No category assigned'}</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Start Date</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{trip.startDate}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>End Date</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>{trip.endDate}</Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Notes</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>
            {trip.notes && trip.notes.trim().length > 0 ? trip.notes : 'No notes added.'}
          </Text>
        </View>

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.infoLabel, { color: c.infoLabel }]}>Activity Summary</Text>
          <Text style={[styles.infoValue, { color: c.infoValue }]}>
            {activityRows.length} activities · {completedActivities.length} completed
          </Text>
        </View>

        <View style={styles.buttonGroup}>
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
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.sectionTitle }]}>Activities</Text>
          <Text style={[styles.sectionSubtitle, { color: c.sectionSubtitle }]}>Add, open and manage activities for this trip.</Text>

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

          {activityRows.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.emptyTitle, { color: c.emptyTitle }]}>No activities yet</Text>
              <Text style={[styles.emptyText, { color: c.emptyText }]}>
                Add your first activity for this trip to start tracking records.
              </Text>
            </View>
          ) : (
            activityRows.map((activity) => {
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
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: c.card, borderColor: c.border },
                    pressed && styles.cardPressed,
                  ]}
                >
                  <View style={styles.rowBetween}>
                    <Text style={[styles.cardTitle, { color: c.cardTitle }]}>{activity.title}</Text>
                    <Text style={[styles.cardDate, { color: c.cardDate }]}>{activity.activityDate}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={[styles.metaPill, { backgroundColor: c.metaPillBg, borderColor: c.border, color: c.metaPillText }]}>
                      {activityCategory ? activityCategory.name : 'Unknown category'}
                    </Text>
                    <Text style={[styles.metaPill, { backgroundColor: c.metaPillBg, borderColor: c.border, color: c.metaPillText }]}>
                      {activity.metricValue} minutes
                    </Text>
                    <Text style={[styles.metaPill, { backgroundColor: c.metaPillBg, borderColor: c.border, color: c.metaPillText }]}>
                      {activity.status}
                    </Text>
                  </View>

                  <Text style={[styles.cardNotes, { color: c.cardNotes }]}>
                    {activity.notes && activity.notes.trim().length > 0
                      ? activity.notes
                      : 'No notes added.'}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: c.sectionTitle }]}>Targets</Text>
          <Text style={[styles.sectionSubtitle, { color: c.sectionSubtitle }]}>Progress is based on completed activities only.</Text>

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
            <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={[styles.emptyTitle, { color: c.emptyTitle }]}>No targets yet</Text>
              <Text style={[styles.emptyText, { color: c.emptyText }]}>Add a target to track your trip progress.</Text>
            </View>
          ) : (
            progressItems.map((item) => (
              <TargetProgressCard
                key={item.target.id}
                item={item}
                onEdit={() =>
                  router.push({
                    pathname: '/trip/[id]/target/[targetId]/edit',
                    params: { id: String(trip.id), targetId: String(item.target.id) },
                  })
                }
                onDelete={() => deleteTarget(item.target)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { padding: 18, paddingBottom: 28 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  message: { fontSize: 16, textAlign: 'center' },
  image: { width: '100%', height: 210, borderRadius: 16, marginBottom: 16 },
  placeholder: { width: '100%', height: 210, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  placeholderText: { fontSize: 16, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: '700' },
  destination: { fontSize: 16, marginTop: 4, marginBottom: 14 },
  infoBox: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  infoLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  infoValue: { fontSize: 15 },
  categoryRow: { flexDirection: 'row', alignItems: 'center' },
  categoryDot: { width: 10, height: 10, borderRadius: 999, marginRight: 8 },
  buttonGroup: { marginTop: 8, marginBottom: 18 },
  spacer: { height: 10 },
  section: { marginTop: 6, marginBottom: 18 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  sectionSubtitle: { fontSize: 14, marginBottom: 12 },
  sectionSpacer: { height: 12 },
  emptyBox: { borderWidth: 1, borderRadius: 14, padding: 14 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyText: { fontSize: 14 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 },
  cardPressed: { opacity: 0.9 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  cardDate: { fontSize: 13 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10, marginBottom: 10 },
  metaPill: { fontSize: 13, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, overflow: 'hidden' },
  cardNotes: { fontSize: 14 },
});
