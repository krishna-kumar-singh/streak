import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from './Text';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color="#4F46E5" />
      {message && (
        <Text variant="muted" style={styles.message}>
          {message}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  message: {
    marginTop: 16,
  },
});
