// Root layout for the app. Sets up the authentication context, theme provider, and database seeding on startup.
// AuthGate redirects unauthenticated users to /login and logged-in users away from auth screens.
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import type { User } from '@/db/auth';
import { seedHolidayPlannerIfEmpty, seedPastTripsAndPhotosIfEmpty } from '@/db/seed';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AuthContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

// Shared auth state — provides currentUser and setCurrentUser to all screens via useContext.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Provides isDark and toggleTheme to any screen that wants to read or control the theme.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

function getThemeFile() {
  return new File(Paths.document, 'theme-preference.json');
}

async function loadThemePreference(): Promise<boolean | null> {
  try {
    const file = getThemeFile();
    if (!file.exists) return null;
    const content = await file.text();
    const parsed = JSON.parse(content);
    return typeof parsed.isDark === 'boolean' ? parsed.isDark : null;
  } catch {
    return null;
  }
}

function saveThemePreference(isDark: boolean): void {
  try {
    getThemeFile().write(JSON.stringify({ isDark }));
  } catch {}
}

// Redirects unauthenticated users to /login and already-logged-in users away from auth screens.
function AuthGate({
  currentUser,
  children,
}: {
  currentUser: User | null;
  children: React.ReactNode;
}) {
  const segments = useSegments();
  const router = useRouter();

  const isAuthScreen = segments[0] === 'login' || segments[0] === 'register';

  useEffect(() => {
    if (!currentUser && !isAuthScreen) {
      router.replace('/login');
    } else if (currentUser && isAuthScreen) {
      router.replace('/');
    }
  }, [currentUser, isAuthScreen]);

  return <>{children}</>;
}

// Inner component so it can consume ThemeContext that RootLayout provides.
function NavigationThemeWrapper({ children }: { children: React.ReactNode }) {
  const themeCtx = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  const isDark = themeCtx !== null ? themeCtx.isDark : systemScheme === 'dark';

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      {children}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      await seedHolidayPlannerIfEmpty();
      await seedPastTripsAndPhotosIfEmpty();
      const savedTheme = await loadThemePreference();
      if (savedTheme !== null) setThemeOverride(savedTheme);
      setAppReady(true);
    };
    prepareApp();
  }, []);

  const isDark = themeOverride !== null ? themeOverride : systemScheme === 'dark';

  const themeValue = useMemo(
    () => ({
      isDark,
      toggleTheme: () => {
        const next = !isDark;
        setThemeOverride(next);
        saveThemePreference(next); // synchronous write
      },
    }),
    [isDark]
  );

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
      <ThemeContext.Provider value={themeValue}>
        <NavigationThemeWrapper>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
            }}
          >
            <ActivityIndicator size="large" />
          </View>
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationThemeWrapper>
      </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={themeValue}>
      <NavigationThemeWrapper>
        <AuthContext.Provider value={authValue}>
          <AuthGate currentUser={currentUser}>
            <Slot />
          </AuthGate>
        </AuthContext.Provider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationThemeWrapper>
    </ThemeContext.Provider>
  );
}
