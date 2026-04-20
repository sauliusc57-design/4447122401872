// Root layout for the app. Sets up the authentication context, theme provider, and database seeding on startup.
// AuthGate redirects unauthenticated users to /login and logged-in users away from auth screens.
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Redirect, Slot, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import type { User } from '@/db/auth';
import { seedHolidayPlannerIfEmpty } from '@/db/seed';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

// Shared auth state — provides currentUser and setCurrentUser to all screens via useContext.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Redirects unauthenticated users to /login and already-logged-in users away from auth screens.
function AuthGate({
  currentUser,
  children,
}: {
  currentUser: User | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthScreen = pathname === '/login' || pathname === '/register';

  if (!currentUser && !isAuthScreen) {
    return <Redirect href="/login" />;
  }

  if (currentUser && isAuthScreen) {
    return <Redirect href="/" />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      await seedHolidayPlannerIfEmpty();
      setAppReady(true);
    };

    prepareApp();
  }, []);

  // Memoized to prevent unnecessary re-renders of all context consumers when unrelated state changes.
  const authValue = useMemo(
    () => ({
      currentUser,
      setCurrentUser,
    }),
    [currentUser]
  );

  if (!appReady) {
    return (
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
          }}
        >
          <ActivityIndicator size="large" />
        </View>
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate currentUser={currentUser}>
          <Slot />
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthContext.Provider>
  );
}