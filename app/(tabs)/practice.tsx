import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Play, Filter, BookOpen, CheckCircle } from 'lucide-react-native';
import { Button, Card, Text as ThemedText, Loading } from '@/components/ui';
import { useAuthStore, usePracticeStore } from '@/shared/store';
import { SUBJECTS, CHAPTERS } from '@/shared/constants';

interface SubjectItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  chaptersCount: number;
  mcqsCount: number;
}

export default function PracticeScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { generateDailyQueue, dailyQueue, fetchDailyQueue } = usePracticeStore();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchDailyQueue();
    if (!dailyQueue) {
      await generateDailyQueue();
    }
    await fetchSubjects();
    setLoading(false);
  };

  const fetchSubjects = async () => {
    const exam = profile?.exam || 'class_10_cbse';
    const selectedSubjectIds = profile?.selected_subjects || [];

    const subjectData: SubjectItem[] = [];
    const subjectList = SUBJECTS[exam] || [];

    for (const subject of subjectList) {
      if (selectedSubjectIds.includes(subject.id)) {
        const chapters = CHAPTERS[subject.id] || [];
        subjectData.push({
          id: subject.id,
          name: subject.name,
          icon: '📚',
          color: subject.color,
          chaptersCount: chapters.length,
          mcqsCount: chapters.length * 10, // Approximate
        });
      }
    }

    setSubjects(subjectData);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) return <Loading fullScreen message="Loading practice data..." />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
      >
        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Practice</ThemedText>
          <ThemedText variant="muted">Choose your practice mode</ThemedText>
        </Animated.View>

        {/* Daily Quest Card */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.questCard}>
          <Card variant="gradient" gradientColors={['#4F46E5', '#7C3AED']} padding="lg" radius="xl">
            <View style={styles.questContent}>
              <View style={styles.questLeft}>
                <ThemedText variant="h3" style={{ color: '#FFFFFF' }}>Today's Quest</ThemedText>
                <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)', marginTop: 8 }}>
                  {(dailyQueue?.completed || 0)} of {(dailyQueue?.total_questions || profile?.daily_goal || 5)} questions
                </ThemedText>
              </View>
              <Button
                title="Start Now"
                onPress={() => router.push('/practice/session')}
                variant="outline"
                size="md"
                style={{ borderColor: '#FFFFFF', paddingHorizontal: 16 }}
              />
            </View>
          </Card>
        </Animated.View>

        {/* Practice Modes */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Practice Modes</ThemedText>
          <View style={styles.modes}>
            <TouchableOpacity onPress={() => router.push('/practice/session?mode=daily')}>
              <Card style={styles.modeCard} padding="lg">
                <View style={[styles.modeIcon, { backgroundColor: 'rgba(79, 70, 229, 0.2)' }]}>
                  <BookOpen size={28} color="#4F46E5" />
                </View>
                <ThemedText variant="h3" style={styles.modeTitle}>Daily Queue</ThemedText>
                <ThemedText variant="muted" style={styles.modeSubtitle}>
                  Your personalized questions for today
                </ThemedText>
                <View style={styles.modeProgress}>
                  <ThemedText variant="label" style={{ color: '#4F46E5' }}>
                    {dailyQueue?.completed || 0}/{dailyQueue?.total_questions || 5} completed
                  </ThemedText>
                </View>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/practice/custom')}>
              <Card style={styles.modeCard} padding="lg">
                <View style={[styles.modeIcon, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
                  <Filter size={28} color="#7C3AED" />
                </View>
                <ThemedText variant="h3" style={styles.modeTitle}>Custom Practice</ThemedText>
                <ThemedText variant="muted" style={styles.modeSubtitle}>
                  Choose subject or chapter
                </ThemedText>
              </Card>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Subjects */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Subjects</ThemedText>
          {subjects.map((subject, index) => (
            <Animated.View key={subject.id} entering={FadeIn.delay(index * 50)}>
              <TouchableOpacity onPress={() => router.push(`/practice/subject?subject=${subject.id}`)}>
                <Card style={styles.subjectCard} padding="md">
                  <View style={styles.subjectContent}>
                    <View style={[styles.subjectIcon, { backgroundColor: subject.color }]}>
                      <ThemedText style={{ fontSize: 20 }}>📚</ThemedText>
                    </View>
                    <View style={styles.subjectText}>
                      <ThemedText variant="h3">{subject.name}</ThemedText>
                      <ThemedText variant="muted" style={styles.subjectMeta}>
                        {subject.chaptersCount} chapters
                      </ThemedText>
                    </View>
                    <Play size={20} color="#4F46E5" />
                  </View>
                </Card>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Recent Performance */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Quick Stats</ThemedText>
          <Card padding="lg" style={styles.statsCard}>
            <View style={styles.stacksRow}>
              <View style={styles.stackItem}>
                <ThemedText style={styles.stackIcon}>📊</ThemedText>
                <ThemedText variant="muted" style={styles.stackLabel}>Today</ThemedText>
                <ThemedText variant="h2">{dailyQueue?.completed || 0}</ThemedText>
              </View>
              <View style={styles.stackDivider} />
              <View style={styles.stackItem}>
                <ThemedText style={styles.stackIcon}>🎯</ThemedText>
                <ThemedText variant="muted" style={styles.stackLabel}>Goal</ThemedText>
                <ThemedText variant="h2">{profile?.daily_goal || 5}</ThemedText>
              </View>
              <View style={styles.stackDivider} />
              <View style={styles.stackItem}>
                <ThemedText style={styles.stackIcon}>🔥</ThemedText>
                <ThemedText variant="muted" style={styles.stackLabel}>Streak</ThemedText>
                <ThemedText variant="h2">{profile?.current_streak || 0}</ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  questCard: { marginBottom: 24 },
  questContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questLeft: { flex: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  modes: { gap: 12 },
  modeCard: { alignItems: 'flex-start' },
  modeIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  modeTitle: { marginBottom: 4 },
  modeSubtitle: { marginBottom: 8 },
  modeProgress: { marginTop: 8 },
  subjectCard: { marginBottom: 8 },
  subjectContent: { flexDirection: 'row', alignItems: 'center' },
  subjectIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  subjectText: { flex: 1 },
  subjectMeta: { marginTop: 2 },
  statsCard: {},
  stacksRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stackItem: { alignItems: 'center' },
  stackIcon: { fontSize: 24, marginBottom: 4 },
  stackLabel: { marginBottom: 4 },
  stackDivider: { width: 1, height: 40, backgroundColor: '#374151' },
});
