import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

import { formatMagnitude, magnitudeBucket } from '../lib/format';
import { bucketColors, spacing } from './theme';

interface Props {
  magnitude: number | null;
  size?: 'small' | 'large';
}

const PULSE_THRESHOLD = 5;

export function MagnitudeBadge({ magnitude, size = 'small' }: Props) {
  const pulse = useSharedValue(1);
  const shouldPulse = magnitude !== null && magnitude >= PULSE_THRESHOLD;

  useEffect(() => {
    if (!shouldPulse) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(1.12, { duration: 900, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [shouldPulse, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  const bucket = magnitudeBucket(magnitude);
  const dimension = size === 'large' ? 72 : 48;

  return (
    <Animated.View
      accessibilityRole="text"
      accessibilityLabel={`Magnitude ${formatMagnitude(magnitude)}`}
      style={[
        styles.badge,
        animatedStyle,
        {
          backgroundColor: bucketColors[bucket],
          width: dimension,
          height: dimension,
          borderRadius: dimension / 4,
        },
      ]}
    >
      <Text style={[styles.value, size === 'large' && styles.valueLarge]}>
        {formatMagnitude(magnitude)}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  value: {
    color: '#0b0f14',
    fontSize: 16,
    fontWeight: '700',
  },
  valueLarge: {
    fontSize: 26,
  },
});
