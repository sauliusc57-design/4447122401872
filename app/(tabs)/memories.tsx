import { AuthContext, ThemeContext } from '@/app/_layout';
import { darkColors, lightColors } from '@/constants/theme';
import { db } from '@/db/client';
import { fetchUserCategories } from '@/db/queries';
import { categories, tripPhotos, trips } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { eq, inArray } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useCallback, useContext, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof trips.$inferSelect;
type TripPhoto = typeof tripPhotos.$inferSelect;
type Category = typeof categories.$inferSelect;

const SEEDED_ASSETS: Record<string, any> = {
  'seeded:Paris': require('../../assets/images/trips/Paris.jpg'),
  'seeded:London': require('../../assets/images/trips/London.jpg'),
  'seeded:Rome': require('../../assets/images/trips/Rome.jpg'),
};

const SEEDED_TITLE_ASSETS: Record<string, any> = {
  'Weekend in Paris': require('../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../assets/images/trips/London.jpg'),
  'Spring in Paris': require('../../assets/images/trips/Paris.jpg'),
  'London City Break': require('../../assets/images/trips/London.jpg'),
  'Roman Holiday': require('../../assets/images/trips/Rome.jpg'),
};

function resolvePhotoSource(uri: string): any {
  return SEEDED_ASSETS[uri] ?? { uri };
}

function getCoverSource(trip: Trip, photos: TripPhoto[]): any {
  const first = photos.find((p) => p.tripId === trip.id);
  if (first) return resolvePhotoSource(first.uri);
  if (SEEDED_TITLE_ASSETS[trip.title]) return SEEDED_TITLE_ASSETS[trip.title];
  return null;
}

function isThisTimeLastYear(trip: Trip): boolean {
  const today = new Date();
  const WINDOW = 7;

  const [, sm, sd] = trip.startDate.split('-').map(Number);
  const [, em, ed] = trip.endDate.split('-').map(Number);

  const startAnniv = new Date(today.getFullYear(), sm - 1, sd);
  const endAnniv = new Date(today.getFullYear(), em - 1, ed);

  const windowStart = new Date(today);
  windowStart.setDate(today.getDate() - WINDOW);
  const windowEnd = new Date(today);
  windowEnd.setDate(today.getDate() + WINDOW);

  return startAnniv <= windowEnd && endAnniv >= windowStart;
}

function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  if (s.getFullYear() !== e.getFullYear()) {
    return `${s.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
  }
  return `${s.toLocaleDateString('en-GB', opts)} – ${e.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
}

export default function MemoriesScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const themeCtx = useContext(ThemeContext);

  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  const currentUser = auth?.currentUser ?? null;

  const [pastTrips, setPastTrips] = useState<Trip[]>([]);
  const [allPhotos, setAllPhotos] = useState<TripPhoto[]>([]);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!currentUser) return;
      let active = true;

      const load = async () => {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        const [allTrips, userCategories] = await Promise.all([
          db.select().from(trips).where(eq(trips.userId, currentUser.id)),
          fetchUserCategories(currentUser.id),
        ]);

        const past = allTrips.filter((t) => t.endDate < today);

        let photos: TripPhoto[] = [];
        if (past.length > 0) {
          photos = await db
            .select()
            .from(tripPhotos)
            .where(inArray(tripPhotos.tripId, past.map((t) => t.id)));
        }

        if (active) {
          setPastTrips(past);
          setAllPhotos(photos);
          setCategoryRows(userCategories);
          setLoading(false);
        }
      };

      load();
      return () => { active = false; };
    }, [currentUser])
  );

  const memoryTrips = useMemo(
    () => pastTrips.filter(isThisTimeLastYear),
    [pastTrips]
  );

  const tripsByYear = useMemo(() => {
    const groups: Record<string, Trip[]> = {};
    for (const trip of pastTrips) {
      const year = trip.endDate.split('-')[0];
      if (!groups[year]) groups[year] = [];
      groups[year].push(trip);
    }
    return groups;
  }, [pastTrips]);

  const sortedYears = useMemo(
    () => Object.keys(tripsByYear).sort((a, b) => Number(b) - Number(a)),
    [tripsByYear]
  );

  if (!currentUser) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.screenTitle, { color: c.title }]}>Memories</Text>
        <Text style={[styles.screenSubtitle, { color: c.subtitle }]}>
          {loading ? 'Loading...' : `${pastTrips.length} past trip${pastTrips.length !== 1 ? 's' : ''}`}
        </Text>

        {!loading && memoryTrips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="sparkles" size={16} color={isDark ? '#7ECDC0' : '#E8873A'} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: c.sectionTitle }]}>This time last year</Text>
            </View>
            <Text style={[styles.sectionSubtitle, { color: c.sectionSubtitle }]}>
              You were travelling around this time in {new Date().getFullYear() - 1}
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.memoryStrip}
            >
              {memoryTrips.map((trip) => {
                const cover = getCoverSource(trip, allPhotos);
                const photoCount = allPhotos.filter((p) => p.tripId === trip.id).length;
                const category = categoryRows.find((cat) => cat.id === trip.categoryId) ?? null;

                return (
                  <Pressable
                    key={trip.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Memory: ${trip.title}`}
                    onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(trip.id) } })}
                    style={({ pressed }) => [styles.memoryCard, pressed && styles.pressed]}
                  >
                    {cover ? (
                      <Image source={cover} style={styles.memoryCardImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.memoryCardImage, styles.memoryCardPlaceholder, { backgroundColor: c.placeholderBg }]} />
                    )}

                    <View style={styles.memoryCardOverlay}>
                      <Text style={styles.memoryCardTitle} numberOfLines={2}>{trip.title}</Text>
                      <Text style={styles.memoryCardDest} numberOfLines={1}>{trip.destination}</Text>
                      <Text style={styles.memoryCardDates}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
                      {photoCount > 0 && (
                        <View style={styles.memoryPhotoCount}>
                          <Ionicons name="images-outline" size={12} color="#fff" />
                          <Text style={styles.memoryPhotoCountText}>{photoCount}</Text>
                        </View>
                      )}
                    </View>

                    {category && (
                      <View style={[styles.memoryBadge, { backgroundColor: c.memoryBadgeBg }]}>
                        <Text style={[styles.memoryBadgeText, { color: c.memoryBadgeText }]} numberOfLines={1}>
                          {category.name}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {!loading && pastTrips.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Ionicons name="camera-outline" size={36} color={c.placeholderText} style={{ marginBottom: 12 }} />
            <Text style={[styles.emptyTitle, { color: c.emptyTitle }]}>No past trips yet</Text>
            <Text style={[styles.emptyText, { color: c.emptyText }]}>
              Trips that have ended will appear here. Add photos to build your travel memories.
            </Text>
          </View>
        )}

        {!loading && pastTrips.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: c.sectionTitle }]}>All Past Trips</Text>

            {sortedYears.map((year) => (
              <View key={year} style={styles.yearGroup}>
                <Text style={[styles.yearLabel, { color: c.yearLabel }]}>{year}</Text>

                {tripsByYear[year].map((trip) => {
                  const cover = getCoverSource(trip, allPhotos);
                  const photoCount = allPhotos.filter((p) => p.tripId === trip.id).length;
                  const category = categoryRows.find((cat) => cat.id === trip.categoryId) ?? null;

                  return (
                    <Pressable
                      key={trip.id}
                      accessibilityRole="button"
                      accessibilityLabel={`${trip.title}, ${trip.destination}, view trip memory`}
                      onPress={() => router.push({ pathname: '/trip/[id]', params: { id: String(trip.id) } })}
                      style={({ pressed }) => [
                        styles.pastCard,
                        { backgroundColor: c.card, borderColor: c.border },
                        pressed && styles.pressed,
                      ]}
                    >
                      {cover ? (
                        <Image source={cover} style={styles.pastCardImage} resizeMode="cover" />
                      ) : (
                        <View style={[styles.pastCardImage, { backgroundColor: c.placeholderBg, alignItems: 'center', justifyContent: 'center' }]}>
                          <Ionicons name="camera-outline" size={28} color={c.placeholderText} />
                        </View>
                      )}

                      <View style={styles.pastCardBody}>
                        <Text style={[styles.pastCardTitle, { color: c.cardTitle }]} numberOfLines={1}>
                          {trip.title}
                        </Text>
                        <Text style={[styles.pastCardMeta, { color: c.cardMeta }]} numberOfLines={1}>
                          {trip.destination}
                        </Text>
                        <Text style={[styles.pastCardMeta, { color: c.cardMeta }]}>
                          {formatDateRange(trip.startDate, trip.endDate)}
                        </Text>

                        <View style={styles.pastCardFooter}>
                          {category && (
                            <View style={styles.categoryRow}>
                              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                              <Text style={[styles.pastCardMeta, { color: c.cardMeta }]}>{category.name}</Text>
                            </View>
                          )}
                          {photoCount > 0 && (
                            <View style={styles.photoCountRow}>
                              <Ionicons name="images-outline" size={13} color={c.cardMeta} />
                              <Text style={[styles.photoCountText, { color: c.cardMeta }]}>{photoCount} photo{photoCount !== 1 ? 's' : ''}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 },
  screenTitle: { fontSize: 28, fontWeight: '700' },
  screenSubtitle: { fontSize: 15, marginTop: 4, marginBottom: 18 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  sectionIcon: { marginRight: 6 },
  sectionTitle: { fontSize: 20, fontWeight: '700' },
  sectionSubtitle: { fontSize: 13, marginBottom: 14 },

  memoryStrip: { paddingBottom: 4 },
  memoryCard: {
    width: 240,
    height: 320,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
  },
  memoryCardImage: { width: '100%', height: '100%', position: 'absolute' },
  memoryCardPlaceholder: { width: '100%', height: '100%', position: 'absolute' },
  memoryCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  memoryCardTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 2 },
  memoryCardDest: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 2 },
  memoryCardDates: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  memoryPhotoCount: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  memoryPhotoCountText: { fontSize: 12, color: '#fff' },
  memoryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  memoryBadgeText: { fontSize: 12, fontWeight: '600' },

  pressed: { opacity: 0.88 },

  yearGroup: { marginBottom: 18 },
  yearLabel: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 10 },

  pastCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
  },
  pastCardImage: { width: 90, height: 90 },
  pastCardBody: { flex: 1, padding: 12, justifyContent: 'center' },
  pastCardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  pastCardMeta: { fontSize: 13, marginBottom: 1 },
  pastCardFooter: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 12 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 8, height: 8, borderRadius: 999 },
  photoCountRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  photoCountText: { fontSize: 13 },

  emptyBox: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
