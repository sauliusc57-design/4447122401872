// Login screen. Validates form input and calls loginUser to authenticate against the local SQLite database.
// On success, sets the current user in AuthContext which triggers navigation to the main app.
import FormField from '@/components/ui/form-field';
import PrimaryButton from '@/components/ui/primary-button';
import { loginUser } from '@/db/auth';
import { Link } from 'expo-router';
import { useContext, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from './_layout';

export default function LoginScreen() {
  // Pull auth state from the root layout context so we can set the user on login.
  const auth = useContext(AuthContext);

  // Controlled inputs bound to the email and password text fields.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Should never be null here, but guards against rendering outside the provider.
  if (!auth) return null;

  const { setCurrentUser } = auth;

  // Validates the form, calls loginUser, and updates global auth state on success.
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    try {
      const user = await loginUser(email, password);
      // Setting currentUser triggers AuthGate to redirect to the main app.
      setCurrentUser(user);
    } catch (error) {
      Alert.alert(
        'Login failed',
        error instanceof Error ? error.message : 'Unable to log in.'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Holiday Planner</Text>
        <Text style={styles.subtitle}>Log in to view your trips and activity records.</Text>

        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="example@email.com"
        />

        <FormField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry
        />

        <PrimaryButton label="Log In" onPress={handleLogin} />

        <View style={styles.spacer} />

        <Link href="/register" asChild>
          <Text style={styles.link}>Create a new account</Text>
        </Link>

        {/* Pre-filled credentials hint so anyone can try the app without registering. */}
        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Demo account</Text>
          <Text style={styles.demoText}>Email: demo@planner.com</Text>
          <Text style={styles.demoText}>Password: demo123</Text>
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
  demoBox: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  demoText: {
    fontSize: 14,
    color: '#475569',
  },
});