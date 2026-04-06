import { Pressable, StyleSheet, Text } from 'react-native';

type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
};

type Props = {
  trip: Trip;
  onPress?: () => void;
};

export default function TripCard({ trip, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open trip ${trip.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
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