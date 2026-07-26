import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Button, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F172A', '#1E293B', '#0F172A']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(200).duration(600)}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.content}>
          <View style={styles.logoContainer}>
            <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.logo}>
              <ThemedText variant="h2" weight="700" style={{ color: '#FFFFFF' }}>S</ThemedText>
            </LinearGradient>
          </View>

          <ThemedText variant="h1" center style={styles.title}>
            STREAK
          </ThemedText>

          <ThemedText variant="body" center style={styles.tagline}>
            Practice Smart, Score Smart
          </ThemedText>

          <ThemedText variant="muted" center style={styles.description}>
            Build a daily exam practice habit. Master concepts with personalized questions and maintain consistency to ace your exams.
          </ThemedText>

          <Animated.View entering={FadeInUp.delay(800)} style={styles.features}>
            <View style={styles.featureItem}>
              <ThemedText style={styles.emoji}>🔥</ThemedText>
              <ThemedText variant="bodySm">Daily Streaks</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <ThemedText style={styles.emoji}>📊</ThemedText>
              <ThemedText variant="bodySm">Smart Analytics</ThemedText>
            </View>
            <View style={styles.featureItem}>
              <ThemedText style={styles.emoji}>🎯</ThemedText>
              <ThemedText variant="bodySm">Weak Topic Focus</ThemedText>
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(1000)} style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <Button
            title="Get Started"
            onPress={() => router.push('/(auth)/login')}
            fullWidth
            size="lg"
          />
          <View style={styles.loginRow}>
            <ThemedText variant="muted">Already have an account?</ThemedText>
            <Text style={styles.loginLink} onPress={() => router.push('/(auth)/login')}>
              Sign In
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroImage: {
    width: width,
    height: height * 0.35,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    letterSpacing: 8,
    marginBottom: 8,
  },
  tagline: {
    color: '#4F46E5',
    fontWeight: '500',
    letterSpacing: 1,
    marginBottom: 24,
  },
  description: {
    paddingHorizontal: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
  },
  featureItem: {
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loginLink: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 14,
  },
});
