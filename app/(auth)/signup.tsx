import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, User } from 'lucide-react-native';
import { Button, Input, Text as ThemedText, Loading } from '@/components/ui';
import { useAuthStore } from '@/shared/store';

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const { signup, isLoading } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onSubmit = async (data: SignupForm) => {
    setError(null);
    const result = await signup(data.email, data.password, data.fullName);
    if (result.error) {
      setError(result.error.message || 'Signup failed');
    } else {
      router.push('/onboarding/step1');
    }
  };

  if (isLoading) return <Loading fullScreen message="Creating account..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 60 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Create Account</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Start your exam preparation journey today
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
            name="fullName"
            render={({ field: { onChange, value }, fieldState }) => (
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                leftIcon={<User size={20} color="#94A3B8" />}
                error={fieldState.error?.message}
              />
            )}
          />

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
                leftIcon={<Mail size={20} color="#94A3B8" />}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value }, fieldState }) => (
              <Input
                label="Password"
                placeholder="Create a strong password"
                value={value}
                onChangeText={onChange}
                secureTextEntry
                error={fieldState.error?.message}
              />
            )}
          />

          <Button
            title="Create Account"
            onPress={handleSubmit(onSubmit)}
            fullWidth
            size="lg"
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.signUpRow}>
            <ThemedText variant="muted">Already have an account?</ThemedText>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <ThemedText style={styles.link}> Sign In</ThemedText>
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
  footer: { marginTop: 32 },
  signUpRow: { flexDirection: 'row', justifyContent: 'center' },
  link: { color: '#4F46E5', fontWeight: '600' },
});
