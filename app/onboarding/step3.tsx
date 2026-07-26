import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowRight, ArrowLeft } from 'lucide-react-native';
import { Button, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { CHAPTERS, SUBJECTS } from '@/shared/constants';

export default function OnboardingStep3() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuthStore();
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  const exam = profile?.exam || 'class_10_cbse';
  const selectedSubjects = profile?.selected_subjects || [];

  useEffect(() => {
    if (profile?.selected_chapters) {
      setSelectedChapters(profile.selected_chapters);
    }
    if (selectedSubjects.length > 0) {
      setExpandedSubjects([selectedSubjects[0]]);
    }
  }, [profile]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const toggleSubjectExpand = (subjectId: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const selectAllChapters = (subjectId: string) => {
    const chapters = CHAPTERS[subjectId] || [];
    const allChapterIds = chapters.map((c: { id: string }) => c.id);
    setSelectedChapters(prev => {
      const existing = prev.filter(id => !allChapterIds.includes(id));
      return [...existing, ...allChapterIds];
    });
  };

  const handleNext = async () => {
    if (selectedChapters.length === 0) return;

    setIsLoading(true);
    await updateProfile({ selected_chapters: selectedChapters });
    setIsLoading(false);
    router.push('/onboarding/step4');
  };

  const getSubjectInfo = (subjectId: string) => {
    const subjectList = SUBJECTS[exam] || [];
    return subjectList.find((s: { id: string; name: string; icon: string; color: string }) => s.id === subjectId);
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
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
          <ThemedText variant="muted">Step 3 of 5</ThemedText>
        </View>

        <View style={styles.header}>
          <ThemedText variant="h1">Choose Chapters</ThemedText>
          <ThemedText variant="muted" style={styles.subtitle}>
            Select chapters to focus on. You can select multiple.
          </ThemedText>
          <ThemedText variant="label" style={styles.selectionCount}>
            {selectedChapters.length} chapters selected
          </ThemedText>
        </View>

        <View style={styles.options}>
          {selectedSubjects.map((subjectId, subjectIndex) => {
            const subjectInfo = getSubjectInfo(subjectId);
            const chapters = CHAPTERS[subjectId] || [];
            const isExpanded = expandedSubjects.includes(subjectId);

            return (
              <Animated.View key={subjectId} entering={FadeIn.delay(subjectIndex * 100)} style={styles.subjectSection}>
                <TouchableOpacity
                  onPress={() => toggleSubjectExpand(subjectId)}
                  style={styles.subjectHeader}
                >
                  <View style={styles.subjectHeaderContent}>
                    <View style={[styles.subjectIconSmall, { backgroundColor: subjectInfo?.color || '#4F46E5' }]}>
                      <ThemedText>📚</ThemedText>
                    </View>
                    <ThemedText variant="h3">{subjectInfo?.name || 'Subject'}</ThemedText>
                  </View>
                  <View style={styles.expandIcon}>
                    <ThemedText>{isExpanded ? '▼' : '▶'}</ThemedText>
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <Animated.View entering={FadeIn} style={styles.chaptersList}>
                    <TouchableOpacity onPress={() => selectAllChapters(subjectId)}>
                      <ThemedText variant="muted" style={styles.selectAllText}>Select All</ThemedText>
                    </TouchableOpacity>
                    {chapters.map((chapter: { id: string; name: string; order: number }) => {
                      const isSelected = selectedChapters.includes(chapter.id);
                      return (
                        <TouchableOpacity
                          key={chapter.id}
                          onPress={() => toggleChapter(chapter.id)}
                          style={[styles.chapterItem, isSelected && styles.chapterItemSelected]}
                        >
                          <View style={styles.chapterContent}>
                            <ThemedText variant="bodySm" style={{ flex: 1 }}>
                              {chapter.order}. {chapter.name}
                            </ThemedText>
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                              {isSelected && <ThemedText style={{ color: '#FFFFFF', fontSize: 12 }}>✓</ThemedText>}
                            </View>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </Animated.View>
                )}
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
              disabled={selectedChapters.length === 0}
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
  header: { marginBottom: 24 },
  subtitle: { marginTop: 8 },
  selectionCount: { marginTop: 8, color: '#4F46E5' },
  options: { marginBottom: 40 },
  subjectSection: { marginBottom: 16 },
  subjectHeader: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectHeaderContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectIconSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIcon: { padding: 4 },
  chaptersList: { marginTop: 8, paddingHorizontal: 8 },
  selectAllText: { paddingVertical: 8, color: '#4F46E5' },
  chapterItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  chapterItemSelected: { backgroundColor: 'rgba(79, 70, 229, 0.2)' },
  chapterContent: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  checkboxSelected: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto' },
  backButton: { padding: 12 },
  buttonContainer: { flex: 1 },
});
