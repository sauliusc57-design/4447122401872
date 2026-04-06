import TripCard from '@/components/TripCard';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { seedHolidayPlannerIfEmpty } from '@/db/seed';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  createdAt: string;
};

export default function IndexScreen() {
  const router = useRouter();
  const [tripRows, setTripRows] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrips = async () => {
      await seedHolidayPlannerIfEmpty();
      const rows = await db.select().from(trips);
      setTripRows(rows);
      setLoading(false);
    };

    loadTrips();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.title}>My Trips</Text>
      <Text style={styles.subtitle}>{tripRows.length} trips saved</Text>

      <View style={styles.buttonRow}>
        <Text style={styles.placeholderButton}>Add Trip</Text>
      </View>

      {loading ? (
        <Text style={styles.message}>Loading trips...</Text>
      ) : tripRows.length === 0 ? (
        <Text style={styles.message}>No trips added yet.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {tripRows.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
            />
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
  buttonRow: {
    marginBottom: 10,
  },
  placeholderButton: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    color: '#FFFFFF',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  listContent: {
    paddingBottom: 24,
    paddingTop: 8,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    paddingTop: 16,
    textAlign: 'center',
  },
});