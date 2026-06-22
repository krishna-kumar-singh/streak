import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react-native';
import { Button, Input, Text as ThemedText, Loading } from '@/components/ui';
import { useAuthStore } from '@/shared/store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, loginWithGoogle, loginWithMagicLink, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [showMagicLink, setShowMagicLink] = useState(false);

  const { control, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    const result = await login(data.email, data.password);
    if (result.error) {
      setError(result.error.message || 'Login failed');
    } else {
      router.replace('/(tabs)/home');
    }
  };

  const onGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result.error) setError(result.error.message);
  };

  const onMagicLink = async () => {
    const email = control._formValues.email;
    if (!email) {
      setError('Please enter your email');
      return;
    }
    const result = await loginWithMagicLink(email);
    if (result.error) {
      setError(result.error.message);
    } else {
      setError(null);
      alert('Magic link sent! Check your inbox.');
    }
  };

  if (isLoading) return <Loading fullScreen message="Signing in..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Welcome Back</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Sign in to continue your practice streak
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.form}>
          {error && (
            <View style={styles.errorBanner}>
              <ThemedText style={{ color: '#EF4444' }}>{error}</ThemedText>
            </View>
          )}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value }, fieldState }) => (
              <Input
                label="Email"
                placeholder="your@email.com"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                error={fieldState.error?.message}
                leftIcon={<Mail size={20} color="#94A3B8" />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <Input
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                autoCapitalize="none"
                error={fieldState.error?.message}
              />
            )}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
            <ThemedText variant="muted" style={styles.forgot}>Forgot password?</ThemedText>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            fullWidth
            size="lg"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.divider}>
          <View style={styles.dividerLine} />
          <ThemedText variant="muted" style={styles.dividerText}>OR</ThemedText>
          <View style={styles.dividerLine} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.alternatives}>
          <TouchableOpacity style={styles.socialButton} onPress={onGoogleLogin}>
            <ThemedText variant="body">🔗 Continue with Google</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton} onPress={onMagicLink}>
            <ThemedText variant="body">✉️ Send Magic Link</ThemedText>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800)} style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.signUpRow}>
            <ThemedText variant="muted">Don't have an account?</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <ThemedText style={styles.signUpLink}> Sign Up</ThemedText>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 24 },
  header: { marginBottom: 40 },
  subtitle: { marginTop: 8 },
  form: { marginBottom: 32 },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  forgot: { alignSelf: 'flex-end', marginBottom: 24 },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#374151' },
  dividerText: { marginHorizontal: 16 },
  alternatives: { gap: 12 },
  socialButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  footer: { marginTop: 32 },
  signUpRow: { flexDirection: 'row', justifyContent: 'center' },
  signUpLink: { color: '#4F46E5', fontWeight: '600' },
});
