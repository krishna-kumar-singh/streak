import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import { Button, Text as ThemedText, Card } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { DAILY_GOAL_OPTIONS } from '@/shared/constants';

export default function OnboardingStep5() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();
  const [selectedGoal, setSelectedGoal] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    await updateProfile({ daily_goal: selectedGoal });
    setIsLoading(false);
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
      >
        <View style={styles.progress}>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotCompleted]} />
            <View style={[styles.dot, styles.dotActive]} />
          </View>
          <ThemedText variant="muted">Step 5 of 5</ThemedText>
        </View>

        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Daily Goal</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Set your daily question target. Start small and build consistency.
          </ThemedText>
        </Animated.View>

        <View style={styles.options}>
          {DAILY_GOAL_OPTIONS.map((option, index) => {
            const isSelected = selectedGoal === option.value;
            return (
              <Animated.View key={option.value} entering={FadeIn.delay(index * 100)}>
                <TouchableOpacity onPress={() => setSelectedGoal(option.value)}>
                  <Card
                    variant={isSelected ? 'gradient' : 'default'}
                    gradientColors={isSelected ? ['#4F46E5', '#7C3AED'] : undefined}
                    style={[styles.goalCard, isSelected && styles.goalCardSelected]}
                  >
                    <View style={styles.goalContent}>
                      <View style={styles.goalHeader}>
                        <ThemedText variant="h2" style={{ color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                          {option.value}
                        </ThemedText>
                        <ThemedText variant="body" style={{ color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                          questions/day
                        </ThemedText>
                      </View>
                      <ThemedText variant="muted" style={styles.goalDescription}>
                        {option.description}
                      </ThemedText>
                    </View>
                    {isSelected && (
                      <View style={styles.goalCheck}>
                        <Check size={24} color="#FFFFFF" />
                      </View>
                    )}
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <Animated.View entering={FadeInDown.delay(500)} style={styles.tipCard}>
          <LinearGradient colors={['rgba(245, 158, 11, 0.1)', 'rgba(251, 191, 36, 0.05)']} style={StyleSheet.absoluteFill} />
          <Card variant="outlined" style={{ backgroundColor: 'transparent', margin: 0 }}>
            <ThemedText style={styles.tipIcon}>💡</ThemedText>
            <ThemedText variant="bodySm" style={styles.tipText}>
              Pro tip: Starting with just 5 questions daily builds a sustainable habit. You can always increase later.
            </ThemedText>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)} style={styles.footer}>
          <Button
            title="Start Practicing"
            onPress={handleComplete}
            fullWidth
            size="lg"
            loading={isLoading}
            rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 24 },
  progress: { marginBottom: 32, alignItems: 'center' },
  progressDots: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  dotCompleted: { backgroundColor: '#10B981' },
  dotActive: { backgroundColor: '#4F46E5', width: 24 },
  header: { marginBottom: 32 },
  subtitle: { marginTop: 8 },
  options: { marginBottom: 24, gap: 12 },
  goalCard: { position: 'relative', overflow: 'hidden' },
  goalCardSelected: { borderWidth: 0 },
  goalContent: { flex: 1 },
  goalHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginBottom: 4 },
  goalDescription: { marginTop: 8 },
  goalCheck: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -16,
  },
  tipCard: { marginBottom: 32, marginTop: 16 },
  tipIcon: { fontSize: 24, marginBottom: 8 },
  tipText: { lineHeight: 20, color: '#F59E0B' },
  footer: { marginTop: 'auto' },
});
