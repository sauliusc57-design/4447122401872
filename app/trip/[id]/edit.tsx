import CategoryFormModal from '@/components/ui/category-form-modal';
import CategoryPicker from '@/components/ui/category-picker';
import DatePickerField from '@/components/ui/date-picker-field';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { fetchUserCategories } from '@/db/queries';
import { categories, trips } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { pickImageFromLibrary } from '@/lib/image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { parseDateString, toDateString } from '@/lib/date-utils';
import { AuthContext, ToastContext } from '../../_layout';

type Trip = typeof trips.$inferSelect;
type Category = typeof categories.$inferSelect;

// Bundled images for seeded demo trips — keyed by trip title
const seededImages: Record<string, any> = {
  'Weekend in Paris': require('../../../assets/images/trips/Paris.jpg'),
  'Summer in Rome': require('../../../assets/images/trips/Rome.jpg'),
  'Week in London': require('../../../assets/images/trips/London.jpg'),
};

// Edit Trip screen — loads an existing trip and saves changes
export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const auth = useContext(AuthContext);
  const toast = useContext(ToastContext);

  const today = new Date();

  const [loading, setLoading] = useState(true);
  const [existingTrip, setExistingTrip] = useState<Trip | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  // Form field state
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

  // Load the trip record and user categories on mount
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
        fetchUserCategories(currentUser.id),
      ]);

      const trip = tripRows[0] ?? null;

      setExistingTrip(trip);
      setCategoryRows(categoryList);

      if (trip) {
        setTitle(trip.title);

        // Split stored "City, Country" destination back into separate fields
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

  // Refresh the category list and return the updated rows
  const reloadCategories = async () => {
    const rows = await fetchUserCategories(currentUser.id);
    setCategoryRows(rows);
    return rows;
  };

  // Insert a new inline category then auto-select it in the picker
  const handleAddCategory = async (name: string, color: string, icon: string) => {
    await db.insert(categories).values({ userId: currentUser.id, name, color, icon });
    const rows = await reloadCategories();
    const created = rows.find((r) => r.name === name && r.color === color);
    if (created) setSelectedCategoryId(created.id);
    setCategoryModalVisible(false);
  };

  // Open the device image library and store the selected URI
  const pickImage = async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setImageUri(uri);
  };

  // Validate inputs then write the updated trip to the database
  const saveTrip = async () => {
    if (!title.trim() || !city.trim()) {
      Alert.alert('Missing details', 'Please complete the title and city.');
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Missing category', 'Please select a category for the trip.');
      return;
    }

    // Combine city and optional country into a single destination string
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

    toast?.showToast('Trip updated!');
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

  // Use a seeded demo image as fallback when no user-selected image exists
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
