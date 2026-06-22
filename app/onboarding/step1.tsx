import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { Button, Text as ThemedText, Card } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import type { Exam } from '@/shared/types';

const examOptions: { value: Exam; title: string; subtitle: string; icon: string }[] = [
  { value: 'class_10_cbse', title: 'Class 10 CBSE', subtitle: 'Board exam preparation', icon: '📚' },
  { value: 'class_12_cbse', title: 'Class 12 CBSE', subtitle: 'Board exam & JEE/NEET prep', icon: '🎯' },
];

export default function OnboardingStep1() {
  const insets = useSafeAreaInsets();
  const { updateProfile } = useAuthStore();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedExam) return;

    setIsLoading(true);
    await updateProfile({ exam: selectedExam });
    setIsLoading(false);
    router.push('/onboarding/step2');
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}
      >
        <Animated.View entering={FadeInDown} style={styles.progress}>
          <View style={styles.progressDots}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <ThemedText variant="muted">Step 1 of 5</ThemedText>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200)} style={styles.header}>
          <ThemedText variant="h1">Choose Your Exam</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Select the exam you're preparing for
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.options}>
          {examOptions.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => setSelectedExam(option.value)}
              style={styles.optionWrapper}
            >
              <Card
                variant={selectedExam === option.value ? 'elevated' : 'default'}
                style={[
                  styles.optionCard,
                  selectedExam === option.value && styles.optionCardSelected,
                ]}
              >
                <LinearGradient
                  colors={selectedExam === option.value ? ['#4F46E5', '#7C3AED'] : ['transparent', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.optionContent}>
                  <ThemedText style={styles.optionIcon}>{option.icon}</ThemedText>
                  <View style={styles.optionText}>
                    <ThemedText variant="h3" style={{ color: selectedExam === option.value ? '#FFFFFF' : '#E2E8F0' }}>
                      {option.title}
                    </ThemedText>
                    <ThemedText variant="muted" style={styles.optionSubtitle}>
                      {option.subtitle}
                    </ThemedText>
                  </View>
                  {selectedExam === option.value && (
                    <Animated.View entering={FadeIn} style={styles.checkmark}>
                      <ThemedText style={{ color: '#10B981' }}>✓</ThemedText>
                    </Animated.View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          <View style={styles.comingSoon}>
            <ThemedText variant="muted" center>
              More exams coming soon: JEE, NEET, UPSC...
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
          <Button
            title="Continue"
            onPress={handleNext}
            fullWidth
            size="lg"
            disabled={!selectedExam}
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
  dotActive: { backgroundColor: '#4F46E5', width: 24 },
  header: { marginBottom: 40 },
  subtitle: { marginTop: 8 },
  options: { marginBottom: 40, gap: 16 },
  optionWrapper: { marginBottom: 8 },
  optionCard: { position: 'relative', overflow: 'hidden', paddingVertical: 20 },
  optionCardSelected: { borderWidth: 2, borderColor: '#4F46E5' },
  optionContent: { flexDirection: 'row', alignItems: 'center', zIndex: 1 },
  optionIcon: { fontSize: 36, marginRight: 20 },
  optionText: { flex: 1 },
  optionSubtitle: { marginTop: 4 },
  checkmark: { padding: 8 },
  comingSoon: {
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  footer: { marginTop: 'auto' },
});
