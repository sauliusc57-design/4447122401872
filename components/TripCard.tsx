import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Trip = {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  imageUri: string | null;
  createdAt: string;
};

type Props = {
  trip: Trip;
  onPress?: () => void;
};

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../assets/images/trips/Rome.jpg'),
};

export default function TripCard({ trip, onPress }: Props) {
  const fallbackImage = seededImages[trip.title];

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {trip.imageUri ? (
        <Image source={{ uri: trip.imageUri }} style={styles.image} />
      ) : fallbackImage ? (
        <Image source={fallbackImage} style={styles.image} />
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
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
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
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  meta: {
    color: '#475569',
    marginTop: 2,
  },
  notes: {
    color: '#334155',
    marginTop: 8,
  },
});