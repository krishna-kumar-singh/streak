import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming, withSpring } from 'react-native-reanimated';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  style?: any;
}

export function AnimatedNumber({
  value,
  duration = 800,
  prefix = '',
  suffix = '',
  style,
}: AnimatedNumberProps) {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withSpring(value, {
      damping: 15,
      stiffness: 100,
    });
  }, [value]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${prefix}${Math.round(animatedValue.value)}${suffix}`,
    };
  });

  return (
    <Animated.Text
      style={[styles.text, style]}
      //@ts-ignore
      animatedProps={animatedProps}
    >
      {`${prefix}${Math.round(value)}${suffix}`}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
