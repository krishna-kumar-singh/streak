import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button, Text as ThemedText, Card } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import type { PracticeMode } from '@/shared/types';

const practiceModes: { value: PracticeMode; title: string; description: string; icon: string }[] = [
  { value: 'subject_wise', title: 'Subject Wise', description: 'Focus on one subject at a time', icon: '📚' },
  { value: 'chapter_wise', title: 'Chapter Wise', description: 'Focus on specific chapters', icon: '📖' },
  { value: 'mixed', title: 'Mixed Practice', description: 'Random questions from all subjects', icon: '🎲' },
];

export default function OnboardingStep4() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();
  const [selectedMode, setSelectedMode] = useState<PracticeMode>('mixed');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    setIsLoading(true);
    await updateProfile({ practice_mode: selectedMode });
    setIsLoading(false);
    router.push('/onboarding/step5');
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
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
          </View>
          <ThemedText variant="muted">Step 4 of 5</ThemedText>
        </View>

        <View style={styles.header}>
          <ThemedText variant="h1">Practice Style</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            How would you like your daily questions organized?
          </ThemedText>
        </View>

        <View style={styles.options}>
          {practiceModes.map((mode, index) => {
            const isSelected = selectedMode === mode.value;
            return (
              <Animated.View key={mode.value} entering={FadeIn.delay(index * 100)}>
                <TouchableOpacity onPress={() => setSelectedMode(mode.value)}>
                  <Card
                    variant={isSelected ? 'elevated' : 'default'}
                    style={[styles.modeCard, isSelected && styles.modeCardSelected]}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['rgba(79, 70, 229, 0.15)', 'rgba(124, 58, 237, 0.15)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.modeContent}>
                      <ThemedText style={styles.modeIcon}>{mode.icon}</ThemedText>
                      <View style={styles.modeText}>
                        <ThemedText variant="h3">{mode.title}</ThemedText>
                        <ThemedText variant="muted" style={styles.modeDescription}>
                          {mode.description}
                        </ThemedText>
                      </View>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <ThemedText style={{ color: '#4F46E5' }}>✓</ThemedText>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <Button
              title="Continue"
              onPress={handleNext}
              size="lg"
              loading={isLoading}
              rightIcon={<ArrowRight size={20} color="#FFFFFF" />}
            />
          </View>
        </View>
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
  header: { marginBottom: 40 },
  subtitle: { marginTop: 8 },
  options: { marginBottom: 40, gap: 16 },
  modeCard: { position: 'relative', overflow: 'hidden' },
  modeCardSelected: { borderColor: '#4F46E5', borderWidth: 2 },
  modeContent: { flexDirection: 'row', alignItems: 'center' },
  modeIcon: { fontSize: 32, marginRight: 20 },
  modeText: { flex: 1 },
  modeDescription: { marginTop: 4 },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  backButton: { padding: 12 },
  buttonContainer: { flex: 1 },
});
