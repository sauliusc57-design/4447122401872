import { ThemeContext } from '@/app/_layout';
import { useContext } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  compact?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
};

export default function PrimaryButton({
  label,
  onPress,
  compact = false,
  variant = 'primary',
}: Props) {
  const themeCtx = useContext(ThemeContext);
  const isDark = themeCtx?.isDark ?? false;

  const buttonStyle = (() => {
    if (variant === 'secondary') {
      return {
        backgroundColor: isDark ? '#251E14' : '#FFFAF4',
        borderColor: isDark ? '#3D3020' : '#E8D5B7',
        borderWidth: 1 as const,
      };
    }
    if (variant === 'danger') {
      return {
        backgroundColor: isDark ? '#2D1010' : '#FFF3F0',
        borderColor: isDark ? '#7C3535' : '#FCA5A5',
        borderWidth: 1 as const,
      };
    }
    return {};
  })();

  const labelStyle = (() => {
    if (variant === 'secondary') return { color: isDark ? '#F5ECD8' : '#2C1F0E' };
    if (variant === 'danger') return { color: isDark ? '#FCA5A5' : '#7F1D1D' };
    return {};
  })();

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        buttonStyle,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          labelStyle,
          compact ? styles.compactLabel : null,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#E8873A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  compact: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  compactLabel: {
    fontSize: 13,
  },
});
