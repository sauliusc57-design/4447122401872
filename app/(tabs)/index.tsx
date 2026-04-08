import TripCard from '@/components/TripCard';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { seedHolidayPlannerIfEmpty } from '@/db/seed';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof trips.$inferSelect;

export default function IndexScreen() {
  const router = useRouter();
  const [tripRows, setTripRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadTrips = async () => {
        setLoading(true);
        await seedHolidayPlannerIfEmpty();
        const rows = await db.select().from(trips);

        if (active) {
          setTripRows(rows);
          setLoading(false);
        }
      };

      loadTrips();

      return () => {
        active = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>My Trips</Text>
      <Text style={styles.subtitle}>{tripRows.length} trips saved</Text>

      <PrimaryButton label="Add Trip" onPress={() => router.push('/trip/add')} />

      {loading ? (
        <Text style={styles.message}>Loading trips...</Text>
      ) : tripRows.length === 0 ? (
        <Text style={styles.message}>No trips added yet.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {tripRows.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
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