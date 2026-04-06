import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { db } from '@/db/client';
import { trips } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTripScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');

  const saveTrip = async () => {
    if (!title.trim() || !destination.trim() || !startDate.trim() || !endDate.trim()) {
      Alert.alert('Missing details', 'Please complete title, destination, start date, and end date.');
      return;
    }

    const now = new Date().toISOString();

    await db.insert(trips).values({
      userId: 1,
      title: title.trim(),
      destination: destination.trim(),
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      notes: notes.trim() ? notes.trim() : null,
      createdAt: now,
    });

    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Add Trip</Text>
        <Text style={styles.subtitle}>Create a new holiday trip.</Text>

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
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  content: {
    padding: 18,
  },
  title: {
    color: '#0F172A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#475569',
    fontSize: 15,
    marginBottom: 18,
  },
  buttonGroup: {
    marginTop: 8,
  },
  spacer: {
    height: 10,
  },
});