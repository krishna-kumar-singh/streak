import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { Button, Input, Text as ThemedText, Loading } from '@/components/ui';
import { supabase } from '@/supabase/client';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'streak://auth/reset-password',
    });

    setIsLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  if (isLoading) return <Loading fullScreen message="Sending reset link..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#94A3B8" />
        </TouchableOpacity>

        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Reset Password</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </ThemedText>
        </Animated.View>

        {sent ? (
          <Animated.View entering={FadeInUp} style={styles.successCard}>
            <ThemedText style={styles.emoji}>✓</ThemedText>
            <ThemedText variant="h3" center>Check Your Email</ThemedText>
            <ThemedText variant="muted" center style={{ marginTop: 12 }}>
              We've sent a password reset link to {email}. The link will expire in 1 hour.
            </ThemedText>
            <Button
              title="Back to Sign In"
              onPress={() => router.push('/(auth)/login')}
              fullWidth
              variant="outline"
              style={{ marginTop: 24 }}
            />
          </Animated.View>
        ) : (
          <>
            {error && (
              <View style={styles.errorBanner}>
                <ThemedText style={{ color: '#EF4444' }}>{error}</ThemedText>
              </View>
            )}

            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              leftIcon={<Mail size={20} color="#94A3B8" />}
            />

            <Button
              title="Send Reset Link"
              onPress={handleReset}
              fullWidth
              size="lg"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 24 },
  backButton: { marginBottom: 24 },
  header: { marginBottom: 40 },
  subtitle: { marginTop: 8 },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  successCard: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  emoji: { fontSize: 48, marginBottom: 16, color: '#10B981' },
});
