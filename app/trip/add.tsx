import CategoryPicker from '@/components/ui/category-picker';
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { categories, trips } from '@/db/schema';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Category = typeof categories.$inferSelect;

export default function AddTripScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [categoryRows, setCategoryRows] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await db.select().from(categories);
      setCategoryRows(rows);

      if (rows.length > 0) {
        setSelectedCategoryId(rows[0].id);
      }
    };

    loadCategories();
  }, []);

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
    if (
      !title.trim() ||
      !destination.trim() ||
      !startDate.trim() ||
      !endDate.trim()
    ) {
      Alert.alert(
        'Missing details',
        'Please complete title, destination, start date, and end date.'
      );
      return;
    }

    if (!selectedCategoryId) {
      Alert.alert('Missing category', 'Please select a category for the trip.');
      return;
    }

    const now = new Date().toISOString();

    await db.insert(trips).values({
      userId: 1,
      categoryId: selectedCategoryId,
      title: title.trim(),
      destination: destination.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      notes: notes.trim() ? notes.trim() : null,
      imageUri,
      createdAt: now,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Trip</Text>
        <Text style={styles.subtitle}>Create a new holiday trip.</Text>

        <PrimaryButton label="Choose Trip Image" onPress={pickImage} />

        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.previewImage}
            resizeMode="cover"
          />
        ) : (
          <Text style={styles.helperText}>No image selected yet.</Text>
        )}

        <CategoryPicker
          categories={categoryRows}
          selectedCategoryId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
          label="Trip Category"
        />

        <FormField
          label="Trip Title"
          value={title}
          onChangeText={setTitle}
          placeholder="Weekend in Paris"
        />

        <FormField
          label="Destination"
          value={destination}
          onChangeText={setDestination}
          placeholder="Paris, France"
        />

        <FormField
          label="Start Date"
          value={startDate}
          onChangeText={setStartDate}
          placeholder="2026-06-12"
        />

        <FormField
          label="End Date"
          value={endDate}
          onChangeText={setEndDate}
          placeholder="2026-06-15"
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
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
    color: '#64748B',
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