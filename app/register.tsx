// Registration screen. Creates a new local user account with a hashed password stored in SQLite.
// On success, sets the current user in AuthContext to log them in immediately.
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { registerUser } from '@/db/auth';
import { Link } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from './_layout';

export default function RegisterScreen() {
  // Pull auth state from the root layout context so we can set the user after registration.
  const auth = useContext(AuthContext);

  // Controlled inputs for the three registration fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Should never be null here, but guards against rendering outside the provider.
  if (!auth) return null;

  const { setCurrentUser } = auth;

  // Validates all fields, checks passwords match, creates the account, then logs the user in.
  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Missing details', 'Please complete all fields.');
      return;
    }

    // Client-side check before sending to the database.
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }

    try {
      const user = await registerUser(email, password);
      // Setting currentUser triggers AuthGate to redirect to the main app.
      setCurrentUser(user);
    } catch (error) {
      Alert.alert(
        'Registration failed',
        error instanceof Error ? error.message : 'Unable to create account.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register a local profile for this device.</Text>

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="your@email.com"
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
        />

        <FormField
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
        />

        <PrimaryButton label="Register" onPress={handleRegister} />

        <View style={styles.spacer} />

        <Link href="/login" asChild>
          <Text style={styles.link}>Already have an account? Log in</Text>
        </Link>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 20,
  },
  spacer: {
    height: 14,
  },
  link: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});