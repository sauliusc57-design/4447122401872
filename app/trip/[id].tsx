import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, trips } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../assets/images/trips/London.jpg'),
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const rows = await db
        .select()
        .from(trips)
        .where(eq(trips.id, Number(id)));

      const foundTrip = rows[0] ?? null;
      setTrip(foundTrip);

      if (foundTrip?.categoryId) {
        const categoryRows = await db
          .select()
          .from(categories)
          .where(eq(categories.id, foundTrip.categoryId));

        setCategory(categoryRows[0] ?? null);
      } else {
        setCategory(null);
      }

      setLoading(false);
    };

    loadTrip();
  }, [id]);

  const deleteTrip = () => {
    if (!trip) return;

    Alert.alert(
      'Delete Trip',
      `Are you sure you want to delete "${trip.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(trips).where(eq(trips.id, trip.id));
            router.back();
          },
        },
      ]
    );
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
  const hasImage =
    typeof trip.imageUri === 'string' && trip.imageUri.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {hasImage ? (
          <Image
            source={{ uri: trip.imageUri! }}
            style={styles.image}
            resizeMode="cover"
          />
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
              style={[
                styles.categoryDot,
                { backgroundColor: category?.color ?? '#CBD5E1' },
              ]}
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
            {trip.notes && trip.notes.trim().length > 0
              ? trip.notes
              : 'No notes added.'}
          </Text>
        </View>

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

        <PrimaryButton
          label="Delete Trip"
          variant="danger"
          onPress={deleteTrip}
        />
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
  spacer: {
    height: 10,
  },
  message: {
    color: '#475569',
    fontSize: 16,
    textAlign: 'center',
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
});