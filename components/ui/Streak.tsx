import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './Text';
import { AnimatedNumber } from './AnimatedNumber';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StreakBadge({ streak, size = 'md', showLabel = false }: StreakBadgeProps) {
  const getFireEmoji = () => {
    if (streak >= 30) return '🔥🔥🔥';
    if (streak >= 14) return '🔥🔥';
    if (streak >= 7) return '🔥';
    return '🔥';
  };

  const sizeMap = {
    sm: { padding: 8, icon: 12 },
    md: { padding: 12, icon: 18 },
    lg: { padding: 16, icon: 24 },
  };

  return (
    <View style={[styles.container, { padding: sizeMap[size].padding }]}>
      <Text style={[styles.emoji, { fontSize: sizeMap[size].icon }]}>{getFireEmoji()}</Text>
      <AnimatedNumber value={streak} duration={600} style={styles.number} />
      <Text variant="muted" style={styles.label}>
        {showLabel ? 'Day Streak' : 'days'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    marginTop: -2,
  },
  number: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginHorizontal: 4,
  },
  label: {
    fontSize: 12,
    marginLeft: 2,
  },
});
