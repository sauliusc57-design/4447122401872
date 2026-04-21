// Pressable button with three variants: primary (dark filled), secondary (light outlined), and danger (red outlined).
// Supports a compact mode for smaller inline buttons.
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
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' ? styles.secondary : null,
        variant === 'danger' ? styles.danger : null,
        compact ? styles.compact : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'secondary' ? styles.secondaryLabel : null,
          variant === 'danger' ? styles.dangerLabel : null,
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
  secondary: {
    backgroundColor: '#FFFAF4',
    borderColor: '#E8D5B7',
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#FFF3F0',
    borderColor: '#FCA5A5',
    borderWidth: 1,
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
  secondaryLabel: {
    color: '#2C1F0E',
  },
  dangerLabel: {
    color: '#7F1D1D',
  },
  compactLabel: {
    fontSize: 13,
  },
});