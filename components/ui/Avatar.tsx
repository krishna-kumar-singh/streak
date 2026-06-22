import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Avatar({ source, name, size = 'md' }: AvatarProps) {
  const sizeMap = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const fontSizeMap = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 32,
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];

  if (source) {
    return (
      <View style={[styles.container, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        <Image
          source={{ uri: source }}
          style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={StyleSheet.absoluteFill}
      >
        <Text style={[styles.initials, { fontSize }]}>
          {getInitials(name)}
        </Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'cover',
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
