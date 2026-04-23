import CategoryFormModal from '@/components/ui/category-form-modal';
import CategoryPicker from '@/components/ui/category-picker';
import DatePickerField from '@/components/ui/date-picker-field';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { fetchUserCategories } from '@/db/queries';
import { categories, trips } from '@/db/schema';
import { pickImageFromLibrary } from '@/lib/image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { toDateString } from '@/lib/date-utils';
import { AuthContext, ThemeContext, ToastContext } from '../_layout';
import { darkColors, lightColors } from '@/constants/theme';

type Category = typeof categories.$inferSelect;

export default function AddTripScreen() {
  const router = useRouter();
  const auth = useContext(AuthContext);
  const toast = useContext(ToastContext);
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;
  const currentUser = auth?.currentUser ?? null;

  const today = new Date();

  const [title, setTitle] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date>(today);
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);

  const loadCategories = async () => {
    if (!currentUser) return;
    const rows = await fetchUserCategories(currentUser.id);
    setCategoryRows(rows);
    return rows;
  };

  useEffect(() => {
    loadCategories().then((rows) => {
      if (rows && rows.length > 0) setSelectedCategoryId(rows[0].id);
    });
  }, []);

  const handleAddCategory = async (name: string, color: string, icon: string) => {
    if (!currentUser) return;
    await db.insert(categories).values({ userId: currentUser.id, name, color, icon });
    const rows = await loadCategories();
    const created = rows?.find((r) => r.name === name && r.color === color);
    if (created) setSelectedCategoryId(created.id);
    setCategoryModalVisible(false);
  };

  const pickImage = async () => {
    const uri = await pickImageFromLibrary();
    if (uri) setImageUri(uri);
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

    const now = new Date().toISOString();

    await db.insert(trips).values({
      userId: currentUser!.id,
      categoryId: selectedCategoryId,
      title: title.trim(),
      destination,
      startDate: toDateString(startDate),
      endDate: toDateString(endDate),
      notes: notes.trim() ? notes.trim() : null,
      imageUri,
      createdAt: now,
    });

    toast?.showToast('Trip created!');
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backButton} onPress={() => router.back()} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={26} color={c.title} />
        </Pressable>

        <Text style={[styles.title, { color: c.title }]}>Add Trip</Text>
        <Text style={[styles.subtitle, { color: c.subtitle }]}>Create a new holiday trip.</Text>

        <PrimaryButton label="Choose Trip Image" onPress={pickImage} />

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.helperText, { color: c.placeholder }]}>No image selected yet.</Text>
        )}

        <CategoryPicker
          categories={categoryRows}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          onAdd={() => setCategoryModalVisible(true)}
          label="Trip Category"
        />

        <FormField
          label="Trip Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Weekend in Paris"
        />

        <FormField
          label="City"
          value={city}
          onChangeText={setCity}
          placeholder="Paris"
        />

        <FormField
          label="Country (optional)"
          value={country}
          onChangeText={setCountry}
          placeholder="France"
        />

        <DatePickerField
          label="Start Date"
          value={startDate}
          onChange={setStartDate}
        />

        <DatePickerField
          label="End Date"
          value={endDate}
          onChange={setEndDate}
        />

        <FormField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional trip notes"
          multiline
        />

        <View style={styles.buttonGroup}>
          <PrimaryButton label="Save Trip" onPress={saveTrip} />
          <View style={styles.spacer} />
          <PrimaryButton
            label="Cancel"
            onPress={() => router.back()}
            variant="secondary"
          />
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
    flex: 1,
  },
  content: {
    padding: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    padding: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
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
    marginTop: 10,
    marginBottom: 14,
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
});
