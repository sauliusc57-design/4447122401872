import Animated from 'react-native-reanimated';

// HelloWave — animated waving hand emoji used on the welcome screen
export function HelloWave() {
  return (
    <Animated.Text
      style={{
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        // Rotate 25deg at the midpoint of each cycle to simulate a wave
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
