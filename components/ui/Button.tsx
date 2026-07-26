import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ColorValue, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  variant = 'primary',
  size = 'md',
  title,
  onPress,
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    md: { paddingVertical: 14, paddingHorizontal: 24, fontSize: 16 },
    lg: { paddingVertical: 18, paddingHorizontal: 32, fontSize: 18 },
  };

  const variantStyles: Record<string, {
    bg: readonly [ColorValue, ColorValue, ...ColorValue[]];
    text: string;
    border: string | null;
  }> = {
    primary: {
      bg: ['#4F46E5', '#6366F1'] as const,
      text: '#FFFFFF',
      border: null,
    },
    secondary: {
      bg: ['#7C3AED', '#8B5CF6'] as const,
      text: '#FFFFFF',
      border: null,
    },
    outline: {
      bg: ['transparent', 'transparent'] as const,
      text: '#4F46E5',
      border: '#4F46E5',
    },
    ghost: {
      bg: ['transparent', 'transparent'] as const,
      text: '#94A3B8',
      border: null,
    },
    danger: {
      bg: ['#EF4444', '#F87171'] as const,
      text: '#FFFFFF',
      border: null,
    },
  };

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
        variantStyle.border && { borderWidth: 2, borderColor: variantStyle.border },
        style,
      ]}
    >
      <LinearGradient
        colors={isDisabled ? ['#374151', '#4B5563'] as const : variantStyle.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.gradient,
          { paddingVertical: sizeStyle.paddingVertical, paddingHorizontal: sizeStyle.paddingHorizontal },
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variantStyle.text} />
        ) : (
          <>
            {leftIcon && <Text style={styles.icon}>{leftIcon}</Text>}
            <Text
              style={[
                styles.text,
                { fontSize: sizeStyle.fontSize, color: isDisabled ? '#94A3B8' : variantStyle.text },
              ]}
            >
              {title}
            </Text>
            {rightIcon && <Text style={styles.icon}>{rightIcon}</Text>}
          </>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    marginHorizontal: 4,
  },
});
