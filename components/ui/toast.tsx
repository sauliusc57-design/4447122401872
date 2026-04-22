import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';

export type ToastType = 'success' | 'delete' | 'error';

type Props = {
  message: string;
  type: ToastType;
  visible: boolean;
};

// Toast — floating notification banner that fades and slides in/out from the top of the screen
export default function Toast({ message, type, visible }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  // Animate in when visible, animate out when hidden
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -12, duration: 160, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  // Green for success/delete, red-toned for errors
  const bgColor =
    type === 'success' ? 'rgba(58, 138, 92, 0.82)' : 'rgba(192, 68, 46, 0.82)';

  return (
    <Animated.View
      style={[styles.container, { backgroundColor: bgColor, opacity, transform: [{ translateY }] }]}
      pointerEvents="none"
    >
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 64,
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
