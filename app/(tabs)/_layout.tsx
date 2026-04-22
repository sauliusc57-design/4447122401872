import { Tabs, useRouter, useSegments } from 'expo-router';
import { useContext, useRef } from 'react';
import { Animated, PanResponder, useWindowDimensions, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, darkColors, lightColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeContext } from '../_layout';

const TAB_NAMES = ['index', 'explore', 'memories', 'profile'];
const TAB_HREFS = ['/', '/explore', '/memories', '/profile'];

// Swipe must start within this fraction of screen width from either edge
const EDGE_FRACTION = 0.22;

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { width: SCREEN_WIDTH } = useWindowDimensions();

  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;
  const bgColor = isDark ? darkColors.background : lightColors.background;

  const isOnTab = segments[0] === '(tabs)';
  const currentTabName = (segments[1] as string) || 'index';
  const currentTabIndex = isOnTab ? Math.max(0, TAB_NAMES.indexOf(currentTabName)) : -1;

  // Stable refs so PanResponder closure stays fresh without being recreated
  const tabIndexRef = useRef(currentTabIndex);
  tabIndexRef.current = currentTabIndex;
  const screenWidthRef = useRef(SCREEN_WIDTH);
  screenWidthRef.current = SCREEN_WIDTH;

  const panX = useRef(new Animated.Value(0)).current;

  const swipeResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        const sw = screenWidthRef.current;
        const edgeZone = sw * EDGE_FRACTION;
        const isEdge = g.x0 < edgeZone || g.x0 > sw - edgeZone;
        return (
          tabIndexRef.current >= 0 &&
          isEdge &&
          Math.abs(g.dx) > 12 &&
          Math.abs(g.dx) > Math.abs(g.dy) * 1.5
        );
      },
      onPanResponderMove: (_, g) => {
        // Damped drag: feels responsive but doesn't move much
        const damped = Math.max(-55, Math.min(55, g.dx * 0.18));
        panX.setValue(damped);
      },
      onPanResponderRelease: (_, g) => {
        const idx = tabIndexRef.current;
        const shouldSwipe = Math.abs(g.dx) > 55 && Math.abs(g.vx) > 0.25;
        const isLeft = g.dx < 0;
        const nextIdx = idx + (isLeft ? 1 : -1);

        if (shouldSwipe && idx >= 0 && nextIdx >= 0 && nextIdx < TAB_NAMES.length) {
          // Navigate then spring back to rest
          router.navigate(TAB_HREFS[nextIdx] as any);
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 300,
            friction: 22,
          }).start();
        } else {
          Animated.spring(panX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 200,
            friction: 18,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(panX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 18,
        }).start();
      },
    })
  ).current;

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }} {...swipeResponder.panHandlers}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: panX }] }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarButton: HapticTab,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Trips',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
            }}
          />

          <Tabs.Screen
            name="explore"
            options={{
              title: 'Insights',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
            }}
          />

          <Tabs.Screen
            name="memories"
            options={{
              title: 'Memories',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="bookmark.fill" color={color} />,
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.right" color={color} />,
            }}
          />
        </Tabs>
      </Animated.View>
    </View>
  );
}
