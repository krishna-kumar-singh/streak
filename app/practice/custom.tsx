import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowLeft, Play, Clock, BookOpen, Layers } from 'lucide-react-native';
import { Button, Card, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { SUBJECTS, CHAPTERS } from '@/shared/constants';

export default function CustomPracticeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const exam = profile?.exam || 'class_10_cbse';
  const availableSubjects = SUBJECTS[exam] || [];

  const [selectedSubject, setSelectedSubject] = useState<string>(availableSubjects[0]?.id || '');
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [timedMode, setTimedMode] = useState<boolean>(false);

  const chaptersForSubject = selectedSubject ? (CHAPTERS[selectedSubject] || []) : [];

  const handleStart = () => {
    router.push({
      pathname: '/practice/session',
      params: {
        mode: 'custom',
        subjectId: selectedSubject,
        chapterId: selectedChapter,
        count: questionCount.toString(),
        timed: timedMode ? 'true' : 'false',
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>Custom Practice</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Subject Selection */}
        <Animated.View entering={FadeInDown} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>1. Select Subject</ThemedText>
          <View style={styles.grid}>
            {availableSubjects.map((sub) => {
              const isSelected = selectedSubject === sub.id;
              return (
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => {
                    setSelectedSubject(sub.id);
                    setSelectedChapter('all');
                  }}
                  style={styles.gridItem}
                >
                  <Card
                    style={[styles.choiceCard, isSelected && { borderColor: sub.color, borderWidth: 2 }]}
                    padding="md"
                  >
                    <View style={[styles.iconCircle, { backgroundColor: sub.color }]}>
                      <BookOpen size={20} color="#FFFFFF" />
                    </View>
                    <ThemedText variant="body" style={styles.choiceText}>{sub.name}</ThemedText>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Chapter Selection */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>2. Select Chapter</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            <TouchableOpacity
              onPress={() => setSelectedChapter('all')}
              style={[styles.chip, selectedChapter === 'all' && styles.chipActive]}
            >
              <ThemedText style={[styles.chipText, selectedChapter === 'all' && styles.chipTextActive]}>
                All Chapters
              </ThemedText>
            </TouchableOpacity>
            {chaptersForSubject.map((ch) => {
              const isSelected = selectedChapter === ch.id;
              return (
                <TouchableOpacity
                  key={ch.id}
                  onPress={() => setSelectedChapter(ch.id)}
                  style={[styles.chip, isSelected && styles.chipActive]}
                >
                  <ThemedText style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {ch.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Question Count */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>3. Number of Questions</ThemedText>
          <View style={styles.chipRow}>
            {[5, 10, 15, 20].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => setQuestionCount(num)}
                style={[styles.countChip, questionCount === num && styles.chipActive]}
              >
                <ThemedText style={[styles.chipText, questionCount === num && styles.chipTextActive]}>
                  {num} Questions
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Timed Mode */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>4. Mode</ThemedText>
          <View style={styles.grid}>
            <TouchableOpacity onPress={() => setTimedMode(false)} style={styles.gridItem}>
              <Card
                style={[styles.choiceCard, !timedMode && { borderColor: '#4F46E5', borderWidth: 2 }]}
                padding="md"
              >
                <Layers size={24} color={!timedMode ? '#4F46E5' : '#94A3B8'} />
                <ThemedText variant="h3" style={{ marginTop: 8 }}>Untimed</ThemedText>
                <ThemedText variant="muted">Practice at your own pace</ThemedText>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTimedMode(true)} style={styles.gridItem}>
              <Card
                style={[styles.choiceCard, timedMode && { borderColor: '#F59E0B', borderWidth: 2 }]}
                padding="md"
              >
                <Clock size={24} color={timedMode ? '#F59E0B' : '#94A3B8'} />
                <ThemedText variant="h3" style={{ marginTop: 8 }}>Timed Mode</ThemedText>
                <ThemedText variant="muted">60 seconds per question</ThemedText>
              </Card>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.cta}>
          <Button
            title="Start Custom Practice"
            onPress={handleStart}
            fullWidth
            size="lg"
            rightIcon={<Play size={20} color="#FFFFFF" />}
          />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: { padding: 8 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 28 },
  sectionTitle: { marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%' },
  choiceCard: { alignItems: 'flex-start', minHeight: 100, justifyContent: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  choiceText: { fontWeight: '600', color: '#FFFFFF' },
  chipRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  countChip: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#334155' },
  chipActive: { backgroundColor: '#4F46E5', borderColor: '#6366F1' },
  chipText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '600' },
  cta: { marginTop: 12, marginBottom: 40 },
});
