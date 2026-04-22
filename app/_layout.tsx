// Root layout for the app. Sets up the authentication context, theme provider, and database seeding on startup.
// AuthGate redirects unauthenticated users to /login and logged-in users away from auth screens.
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { File, Paths } from 'expo-file-system';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import type { User } from '@/db/auth';
import { seedHolidayPlannerIfEmpty, seedPastTripsAndPhotosIfEmpty } from '@/db/seed';
import { useColorScheme } from '@/hooks/use-color-scheme';
import Toast, { type ToastType } from '@/components/ui/toast';

type AuthContextValue = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
};

type ThemeContextValue = {
  isDark: boolean;
  toggleTheme: () => void;
};

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

// Shared auth state — provides currentUser and setCurrentUser to all screens via useContext.
export const AuthContext = createContext<AuthContextValue | null>(null);

// Provides isDark and toggleTheme to any screen that wants to read or control the theme.
export const ThemeContext = createContext<ThemeContextValue | null>(null);

// Global toast notifications — call showToast from any screen.
export const ToastContext = createContext<ToastContextValue | null>(null);

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    toastTimer.current = setTimeout(() => setToastVisible(false), 2500);
  }, []);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await seedHolidayPlannerIfEmpty();
        await seedPastTripsAndPhotosIfEmpty();
        const savedTheme = await loadThemePreference();
        if (savedTheme !== null) setThemeOverride(savedTheme);
      } catch (e) {
        console.error('App preparation failed:', e);
      } finally {
        setAppReady(true);
      }
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

  const toastValue = useMemo(() => ({ showToast }), [showToast]);

  if (!appReady) {
    return (
      <ThemeContext.Provider value={themeValue}>
        <NavigationThemeWrapper>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: isDark ? '#1C1612' : '#FDF6EE',
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
      <ToastContext.Provider value={toastValue}>
        <NavigationThemeWrapper>
          <AuthContext.Provider value={authValue}>
            <AuthGate currentUser={currentUser}>
              <Slot />
            </AuthGate>
          </AuthContext.Provider>
          <Toast message={toastMessage} type={toastType} visible={toastVisible} />
          <StatusBar style={isDark ? 'light' : 'dark'} />
        </NavigationThemeWrapper>
      </ToastContext.Provider>
    </ThemeContext.Provider>
  );
}
