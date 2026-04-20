// Profile screen. Shows the logged-in user's email with options to log out or permanently delete their account and all associated data.
import PrimaryButton from '@/components/ui/primary-button';
import { deleteUserProfile } from '@/db/auth';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../_layout';

export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  if (!auth) return null;

  const { currentUser, setCurrentUser } = auth;

  if (!currentUser) return null;

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleDeleteProfile = () => {
    Alert.alert(
      'Delete Profile',
      'This will delete your profile and all of your trips, activities, categories, and targets.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteUserProfile(currentUser.id);
            setCurrentUser(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account for this device.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Logged in as</Text>
          <Text style={styles.value}>{currentUser.email}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
          onPress={() => router.push('/categories' as any)}
          style={styles.menuRow}
        >
          <Text style={styles.menuRowText}>Manage Categories</Text>
          <Text style={styles.menuRowChevron}>›</Text>
        </Pressable>

        <View style={styles.spacer} />

        <PrimaryButton label="Log Out" onPress={handleLogout} />

        <View style={styles.spacer} />

        <PrimaryButton
          label="Delete Profile"
          variant="danger"
          onPress={handleDeleteProfile}
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
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  spacer: {
    height: 10,
  },
  menuRow: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuRowText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  menuRowChevron: {
    fontSize: 20,
    color: '#94A3B8',
  },
});