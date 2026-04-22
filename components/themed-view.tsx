import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

// ThemedView — View component that automatically applies the current theme background colour
export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Resolve background colour from the active theme, with optional per-instance overrides
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
