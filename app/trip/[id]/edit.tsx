import CategoryFormModal from '@/components/ui/category-form-modal';
import CategoryPicker from '@/components/ui/category-picker';
import DatePickerField from '@/components/ui/date-picker-field';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, trips } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../_layout';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../../assets/images/trips/London.jpg'),
};

function parseDateString(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);

  const today = new Date();

  const [loading, setLoading] = useState(true);
  const [existingTrip, setExistingTrip] = useState<Trip | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  if (!auth?.currentUser) return null;

  const { currentUser } = auth;

  useEffect(() => {
    const loadTrip = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const [tripRows, categoryList] = await Promise.all([
        db
          .select()
          .from(trips)
          .where(and(eq(trips.id, Number(id)), eq(trips.userId, currentUser.id))),
        db.select().from(categories).where(eq(categories.userId, currentUser.id)),
      ]);

      const trip = tripRows[0] ?? null;

      setExistingTrip(trip);
      setCategoryRows(categoryList);

      if (trip) {
        setTitle(trip.title);

        const commaIdx = trip.destination.indexOf(', ');
        if (commaIdx >= 0) {
          setCity(trip.destination.slice(0, commaIdx));
          setCountry(trip.destination.slice(commaIdx + 2));
        } else {
          setCity(trip.destination);
          setCountry('');
        }

        setStartDate(parseDateString(trip.startDate));
        setEndDate(parseDateString(trip.endDate));
        setNotes(trip.notes ?? '');
        setImageUri(trip.imageUri ?? null);
        setSelectedCategoryId(trip.categoryId ?? null);
      }

      setLoading(false);
    };

    loadTrip();
  }, [id, currentUser.id]);

  const reloadCategories = async () => {
    const rows = await db.select().from(categories).where(eq(categories.userId, currentUser.id));
    setCategoryRows(rows);
    return rows;
  };

  const handleAddCategory = async (name: string, color: string, icon: string) => {
    await db.insert(categories).values({ userId: currentUser.id, name, color, icon });
    const rows = await reloadCategories();
    const created = rows.find((r) => r.name === name && r.color === color);
    if (created) setSelectedCategoryId(created.id);
    setCategoryModalVisible(false);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }

    setImageUri(result.assets[0].uri);
  };

  const saveTrip = async () => {
    if (!title.trim() || !city.trim()) {
      Alert.alert('Missing details', 'Please complete the title and city.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Missing category', 'Please select a category for the trip.');
      return;
    }

    const destination = country.trim()
      ? `${city.trim()}, ${country.trim()}`
      : city.trim();

    await db
      .update(trips)
      .set({
        categoryId: selectedCategoryId,
        title: title.trim(),
        destination,
        startDate: toDateString(startDate),
        endDate: toDateString(endDate),
        notes: notes.trim() ? notes.trim() : null,
        imageUri,
      })
      .where(and(eq(trips.id, Number(id)), eq(trips.userId, currentUser.id)));

    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Loading trip...</Text>
      </SafeAreaView>
    );
  }

  if (!existingTrip) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Trip not found.</Text>
      </SafeAreaView>
    );
  }

  const fallbackImage = seededImages[existingTrip.title];
  const hasValidLocalImage = typeof imageUri === 'string' && imageUri.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Edit Trip</Text>
        <Text style={styles.subtitle}>Update your saved trip details.</Text>

        <PrimaryButton label="Choose New Image" onPress={pickImage} />

        {hasValidLocalImage ? (
          <Image source={{ uri: imageUri! }} style={styles.previewImage} resizeMode="cover" />
        ) : fallbackImage ? (
          <Image source={fallbackImage} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <Text style={styles.helperText}>No image selected yet.</Text>
        )}

        <CategoryPicker
          categories={categoryRows}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onAdd={() => setCategoryModalVisible(true)}
          label="Trip Category"
        />

        <FormField label="Trip Title" value={title} onChangeText={setTitle} placeholder="Weekend in Paris" />

        <FormField label="City" value={city} onChangeText={setCity} placeholder="Paris" />

        <FormField label="Country (optional)" value={country} onChangeText={setCountry} placeholder="France" />

        <DatePickerField label="Start Date" value={startDate} onChange={setStartDate} />

        <DatePickerField label="End Date" value={endDate} onChange={setEndDate} />

        <FormField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional trip notes"
          multiline
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Save Changes" onPress={saveTrip} />
          <View style={styles.spacer} />
          <PrimaryButton label="Cancel" variant="secondary" onPress={() => router.back()} />
        </View>
      </ScrollView>

      <CategoryFormModal
        visible={categoryModalVisible}
        onSave={handleAddCategory}
        onCancel={() => setCategoryModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FDF6EE',
    flex: 1,
  },
  content: {
    padding: 18,
  },
  title: {
    color: '#2C1F0E',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#5C4A2E',
    fontSize: 15,
    marginBottom: 18,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 14,
  },
  helperText: {
    color: '#9C886C',
    marginTop: 10,
    marginBottom: 14,
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
  message: {
    color: '#5C4A2E',
    fontSize: 16,
    textAlign: 'center',
    paddingTop: 24,
  },
});
