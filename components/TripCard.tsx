// Displays a trip as a pressable card showing its image, title, destination, dates, category, and notes.
// Tapping the card navigates to the trip detail screen.
import { ThemeContext } from '@/app/_layout';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Trip = {
  id: number;
  userId: number;
  categoryId: number | null;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string | null;
  imageUri?: string | null;
  createdAt: string;
};

type Category = {
  id: number;
  userId: number;
  name: string;
  color: string;
  icon: string;
};

type Props = {
  trip: Trip;
  category: Category | null;
};

// Bundled images for the three demo trips — used as fallback when a trip has no saved imageUri.
const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../assets/images/trips/Rome.jpg'),
  'Week in London': require('../assets/images/trips/London.jpg'),
};

const lightColors = {
  card: '#FFFAF4',
  border: '#E8D5B7',
  title: '#2C1F0E',
  meta: '#5C4A2E',
  category: '#5C4A2E',
  notes: '#5C4A2E',
  placeholder: '#E8D5B7',
  placeholderText: '#9C886C',
};

const darkColors = {
  card: '#251E14',
  border: '#3D3020',
  title: '#F5ECD8',
  meta: '#D4C4A8',
  category: '#D4C4A8',
  notes: '#D4C4A8',
  placeholder: '#1C1612',
  placeholderText: '#9C886C',
};

export default function TripCard({ trip, category }: Props) {
  const router = useRouter();
  const themeCtx = useContext(ThemeContext);

  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

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
      style={({ pressed }) => [styles.card, { backgroundColor: c.card, borderColor: c.border }, pressed && styles.pressed]}
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
        <View style={[styles.placeholder, { backgroundColor: c.placeholder }]}>
          <Text style={[styles.placeholderText, { color: c.placeholderText }]}>No Image</Text>
        </View>
      )}

      <Text style={[styles.title, { color: c.title }]}>{trip.title}</Text>
      <Text style={[styles.meta, { color: c.meta }]}>{trip.destination}</Text>
      <Text style={[styles.meta, { color: c.meta }]}>
        {trip.startDate} → {trip.endDate}
      </Text>

      <View style={styles.categoryRow}>
        <View
          style={[
            styles.categoryDot,
            { backgroundColor: category?.color ?? '#E8D5B7' },
          ]}
        />
        <Text style={[styles.categoryText, { color: c.category }]}>
          {category ? category.name : 'No category assigned'}
        </Text>
      </View>

      {trip.notes ? <Text style={[styles.notes, { color: c.notes }]}>{trip.notes}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
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
  },
  placeholderText: {
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meta: {
    fontSize: 14,
    marginBottom: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    marginTop: 8,
  },
});
