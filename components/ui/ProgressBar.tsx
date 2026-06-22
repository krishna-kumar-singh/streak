import React from 'react';
import { View, Text, StyleSheet, ColorValue } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useDerivedValue } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface ProgressBarProps {
  progress: number;
  total?: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  animated?: boolean;
}

export function ProgressBar({
  progress,
  total,
  label,
  showPercentage = true,
  size = 'md',
  gradientColors = ['#4F46E5', '#6366F1'] as const,
  animated = true,
}: ProgressBarProps) {
  const percentage = total ? Math.round((progress / total) * 100) : Math.round(progress);

  const animatedWidth = useDerivedValue(() => {
    return withTiming(Math.min(percentage, 100), { duration: animated ? 500 : 0 });
  }, [percentage]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  const sizeStyles = {
    sm: { height: 8 },
    md: { height: 12 },
    lg: { height: 16 },
  };

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.header}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={styles.percentage}>
              {total ? `${progress}/${total}` : `${percentage}%`}
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, sizeStyles[size]]}>
        <Animated.View style={[styles.fill, animatedStyle]}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E2E8F0',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  track: {
    backgroundColor: '#374151',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
