// Profile screen. Shows the logged-in user's email with options to toggle dark mode, manage categories, log out, or delete their account.
import PrimaryButton from '@/components/ui/primary-button';
import { deleteUserProfile } from '@/db/auth';
import { useRouter } from 'expo-router';
import { useContext } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext, ThemeContext } from '../_layout';

const lightColors = {
  background: '#FDF6EE',
  title: '#2C1F0E',
  subtitle: '#5C4A2E',
  card: '#FFFAF4',
  border: '#E8D5B7',
  label: '#5C4A2E',
  value: '#2C1F0E',
  menuText: '#2C1F0E',
  chevron: '#9C886C',
};

const darkColors = {
  background: '#1C1612',
  title: '#F5ECD8',
  subtitle: '#D4C4A8',
  card: '#251E14',
  border: '#3D3020',
  label: '#D4C4A8',
  value: '#F5ECD8',
  menuText: '#F5ECD8',
  chevron: '#9C886C',
};

export default function ProfileScreen() {
  const auth = useContext(AuthContext);
  const themeCtx = useContext(ThemeContext);
  const router = useRouter();

  const isDark = themeCtx?.isDark ?? false;
  const c = isDark ? darkColors : lightColors;

  if (!auth || !themeCtx || !auth.currentUser) return null;

  const { currentUser, setCurrentUser } = auth;
  const { toggleTheme } = themeCtx;

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: c.title }]}>Profile</Text>
        <Text style={[styles.subtitle, { color: c.subtitle }]}>Manage your account for this device.</Text>

        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.label, { color: c.label }]}>Logged in as</Text>
          <Text style={[styles.value, { color: c.value }]}>{currentUser.email}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Manage categories"
          onPress={() => router.push('/categories' as any)}
          style={[styles.menuRow, { backgroundColor: c.card, borderColor: c.border }]}
        >
          <Text style={[styles.menuRowText, { color: c.menuText }]}>Manage Categories</Text>
          <Text style={[styles.menuRowChevron, { color: c.chevron }]}>›</Text>
        </Pressable>

        <View style={[styles.menuRow, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.menuRowText, { color: c.menuText }]}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            accessibilityLabel="Toggle dark mode"
          />
        </View>

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
  },
  content: {
    padding: 18,
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
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  spacer: {
    height: 10,
  },
  menuRow: {
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
  },
  menuRowChevron: {
    fontSize: 20,
  },
});
