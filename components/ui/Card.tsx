import React from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'gradient' | 'outlined' | 'elevated';
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  padding?: 'sm' | 'md' | 'lg';
  radius?: 'md' | 'lg' | 'xl';
  style?: any;
}

export function Card({
  children,
  variant = 'default',
  gradientColors,
  padding = 'md',
  radius = 'lg',
  style,
}: CardProps) {
  const paddingMap = {
    sm: 12,
    md: 16,
    lg: 24,
  };

  const radiusMap = {
    md: 12,
    lg: 16,
    xl: 24,
  };

  if (variant === 'gradient' && gradientColors) {
    return (
      <View style={[styles.card, { borderRadius: radiusMap[radius] }, style]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { padding: paddingMap[padding], borderRadius: radiusMap[radius] }]}
        >
          {children}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' && styles.outlined,
        variant === 'elevated' && styles.elevated,
        { padding: paddingMap[padding], borderRadius: radiusMap[radius] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    marginBottom: 12,
    borderWidth: 0,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  elevated: {
    backgroundColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
});
