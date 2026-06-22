import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { SUBJECTS } from '@/shared/constants';

export default function OnboardingStep2() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuthStore();
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const exam = profile?.exam || 'class_10_cbse';
  const subjects = SUBJECTS[exam] || [];

  useEffect(() => {
    if (profile?.selected_subjects) {
      setSelectedSubjects(profile.selected_subjects);
    }
  }, [profile]);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleNext = async () => {
    if (selectedSubjects.length === 0) return;

    setIsLoading(true);
    await updateProfile({ selected_subjects: selectedSubjects });
    setIsLoading(false);
    router.push('/onboarding/step3');
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
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <ThemedText variant="muted">Step 2 of 5</ThemedText>
        </View>

        <View style={styles.header}>
          <ThemedText variant="h1">Choose Subjects</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Select subjects you want to practice. You can select multiple.
          </ThemedText>
        </View>

        <View style={styles.options}>
          {subjects.map((subject, index) => {
            const isSelected = selectedSubjects.includes(subject.id);
            return (
              <Animated.View key={subject.id} entering={FadeIn.delay(index * 100)}>
                <TouchableOpacity onPress={() => toggleSubject(subject.id)}>
                  <View
                    style={[
                      styles.subjectCard,
                      isSelected && styles.subjectCardSelected,
                    ]}
                  >
                    {isSelected && (
                      <LinearGradient
                        colors={['rgba(79, 70, 229, 0.2)', 'rgba(124, 58, 237, 0.2)']}
                        style={StyleSheet.absoluteFill}
                      />
                    )}
                    <View style={styles.subjectContent}>
                      <View style={[styles.subjectIcon, { backgroundColor: subject.color }]}>
                        <ThemedText style={{ fontSize: 24 }}>📚</ThemedText>
                      </View>
                      <View style={styles.subjectText}>
                        <ThemedText variant="h3" style={{ color: isSelected ? '#FFFFFF' : '#E2E8F0' }}>
                          {subject.name}
                        </ThemedText>
                      </View>
                      <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                        {isSelected && <ThemedText style={{ color: '#FFFFFF' }}>✓</ThemedText>}
                      </View>
                    </View>
                  </View>
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
              disabled={selectedSubjects.length === 0}
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
  options: { marginBottom: 40, gap: 12 },
  subjectCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#374151',
  },
  subjectCardSelected: { borderColor: '#4F46E5', borderWidth: 2 },
  subjectContent: { flexDirection: 'row', alignItems: 'center' },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  subjectText: { flex: 1 },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#4F46E5' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  backButton: { padding: 12 },
  buttonContainer: { flex: 1 },
});
