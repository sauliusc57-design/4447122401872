import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Trip = {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  imageUri?: string | null;
  createdAt: string;
};

type Props = {
  trip: Trip;
};

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../assets/images/trips/Rome.jpg'),
  'Week in London': require('../assets/images/trips/London.jpg'),
};

export default function TripCard({ trip }: Props) {
  const router = useRouter();

  const fallbackImage = seededImages[trip.title];
  const hasValidLocalImage =
    typeof trip.imageUri === 'string' && trip.imageUri.length > 0;

  return (
    <Pressable
      accessibilityLabel={`${trip.title}, ${trip.destination}, view trip details`}
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: '/trip/[id]',
          params: { id: String(trip.id) },
        })
      }
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {hasValidLocalImage ? (
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
      <Text style={styles.meta}>{trip.destination}</Text>
      <Text style={styles.meta}>
        {trip.startDate} → {trip.endDate}
      </Text>

      {trip.notes ? <Text style={styles.notes}>{trip.notes}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  pressed: {
    opacity: 0.9,
  },
  image: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    marginBottom: 12,
  },
  placeholder: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    color: '#475569',
    fontSize: 14,
    marginBottom: 2,
  },
  notes: {
    color: '#334155',
    fontSize: 14,
    marginTop: 8,
  },
});