import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Play, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react-native';
import { Button, Card, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { SUBJECTS, CHAPTERS } from '@/shared/constants';

export default function SubjectPracticeScreen() {
  const insets = useSafeAreaInsets();
  const { subject: subjectParam } = useLocalSearchParams<{ subject?: string }>();
  const { profile } = useAuthStore();

  const exam = profile?.exam || 'class_10_cbse';
  const allSubjects = SUBJECTS[exam] || [];
  const currentSubject = allSubjects.find(s => s.id === subjectParam) || allSubjects[0];
  const chapters = currentSubject ? (CHAPTERS[currentSubject.id] || []) : [];

  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);

  const toggleChapter = (chapterId: string) => {
    setSelectedChapters(prev =>
      prev.includes(chapterId)
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };

  const handleStartPractice = (chapterId?: string) => {
    router.push({
      pathname: '/practice/session',
      params: {
        mode: 'subject',
        subjectId: currentSubject?.id,
        chapterId: chapterId || (selectedChapters.length > 0 ? selectedChapters.join(',') : 'all'),
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
        <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>{currentSubject?.name || 'Subject'}</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <Animated.View entering={FadeInDown} style={styles.banner}>
          <Card variant="gradient" gradientColors={[currentSubject?.color || '#4F46E5', '#7C3AED']} padding="lg" radius="xl">
            <View style={styles.bannerContent}>
              <View style={styles.bannerText}>
                <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>{currentSubject?.name}</ThemedText>
                <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {chapters.length} Chapters Available
                </ThemedText>
              </View>
              <View style={styles.bannerIcon}>
                <BookOpen size={48} color="#FFFFFF" opacity={0.6} />
              </View>
            </View>
            <View style={{ marginTop: 16 }}>
              <Button
                title="Practice All Chapters"
                onPress={() => handleStartPractice()}
                variant="outline"
                style={{ borderColor: '#FFFFFF' }}
                rightIcon={<Play size={18} color="#FFFFFF" />}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Chapters List */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Chapters</ThemedText>
          {chapters.map((ch, index) => {
            const isSelected = selectedChapters.includes(ch.id);
            return (
              <Animated.View key={ch.id} entering={FadeInDown.delay(index * 50)}>
                <TouchableOpacity onPress={() => handleStartPractice(ch.id)}>
                  <Card style={styles.chapterCard} padding="md">
                    <View style={styles.chapterContent}>
                      <View style={styles.chapterBadge}>
                        <ThemedText variant="label" style={{ color: currentSubject?.color || '#4F46E5' }}>
                          Ch {ch.order}
                        </ThemedText>
                      </View>
                      <View style={styles.chapterInfo}>
                        <ThemedText variant="body" style={{ fontWeight: '600', color: '#FFFFFF' }}>{ch.name}</ThemedText>
                        <ThemedText variant="muted">Tap to practice chapter</ThemedText>
                      </View>
                      <ChevronRight size={20} color="#94A3B8" />
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
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
  banner: { marginBottom: 24 },
  bannerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bannerText: { flex: 1 },
  bannerIcon: { marginLeft: 16 },
  section: { marginBottom: 28 },
  sectionTitle: { marginBottom: 12 },
  chapterCard: { marginBottom: 10 },
  chapterContent: { flexDirection: 'row', alignItems: 'center' },
  chapterBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(79, 70, 229, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  chapterInfo: { flex: 1 },
});
