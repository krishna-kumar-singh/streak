import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Play, TrendingUp, Target, AlertCircle } from 'lucide-react-native';
import { Button, Card, ProgressBar, Text as ThemedText, StreakBadge, Loading, AnimatedNumber } from '@/components/ui';
import { useAuthStore, usePracticeStore } from '@/shared/store';
import { MOTIVATIONAL_QUOTES, SUBJECTS } from '@/shared/constants';
import { supabase } from '@/supabase/client';

interface UserStats {
  todayCompleted: number;
  todayGoal: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  accuracy: number;
  weakTopics: { chapter: string; subject: string; accuracy: number }[];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { profile, fetchProfile } = useAuthStore();
  const { generateDailyQueue, dailyQueue, fetchDailyQueue } = usePracticeStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyQuote] = useState(() =>
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchProfile();
    await fetchDailyQueue();
    if (!dailyQueue) {
      await generateDailyQueue();
    }
    await fetchStats();
    setLoading(false);
  };

  const fetchStats = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    // Get today's analytics
    const { data: todayAnalytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // Get overall stats from attempts
    const { data: attempts } = await supabase
      .from('attempts')
      .select('is_correct, mcq_id, mcqs(chapter_id, chapters(name, subject_id), subjects(name))')
      .eq('user_id', userId);

    const totalQuestions = attempts?.length || 0;
    const correctAnswers = attempts?.filter(a => a.is_correct).length || 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Get weak topics (lowest accuracy chapters)
    const chapterStats: Record<string, { correct: number; total: number; chapter: string; subject: string }> = {};

    attempts?.forEach(a => {
      const mcq = a.mcqs as any;
      if (mcq?.chapter_id) {
        if (!chapterStats[mcq.chapter_id]) {
          chapterStats[mcq.chapter_id] = {
            correct: 0,
            total: 0,
            chapter: mcq.chapters?.name || 'Unknown',
            subject: mcq.subjects?.name || 'Unknown',
          };
        }
        chapterStats[mcq.chapter_id].total++;
        if (a.is_correct) chapterStats[mcq.chapter_id].correct++;
      }
    });

    const weakTopics = Object.entries(chapterStats)
      .map(([id, data]) => ({
        chapter: data.chapter,
        subject: data.subject,
        accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .filter(t => t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    setStats({
      todayCompleted: todayAnalytics?.total_questions || 0,
      todayGoal: profile?.daily_goal || 5,
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      totalQuestions,
      accuracy,
      weakTopics,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) return <Loading fullScreen message="Loading your dashboard..." />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4F46E5" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="muted">Good morning,</ThemedText>
          <ThemedText variant="h1">{profile?.full_name?.split(' ')[0] || 'Student'}!</ThemedText>
        </Animated.View>

        {/* Streak Card */}
        <Animated.View entering={FadeInUp.delay(100)} style={styles.streakCard}>
          <Card variant="gradient" gradientColors={['#4F46E5', '#7C3AED']} padding="lg" radius="xl">
            <View style={styles.streakContent}>
              <View>
                <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>Keep Going!</ThemedText>
                <StreakBadge streak={stats?.currentStreak || 0} showLabel size="lg" />
              </View>
              <View style={styles.streakIcon}>
                <ThemedText style={{ fontSize: 64 }}>🔥</ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Today's Progress */}
        <Animated.View entering={FadeInUp.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Today's Progress</ThemedText>
          <Card padding="lg" radius="lg">
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <AnimatedNumber value={stats?.todayCompleted || 0} suffix={` / ${stats?.todayGoal || 5}`} style={styles.progressNumber} />
                <ThemedText variant="muted">questions completed</ThemedText>
              </View>
              <View style={[styles.progressCircle, { backgroundColor: stats?.todayCompleted >= (stats?.todayGoal || 5) ? '#10B981' : '#374151' }]}>
                {stats?.todayCompleted >= (stats?.todayGoal || 5) ? (
                  <ThemedText style={{ color: '#FFFFFF' }}>✓</ThemedText>
                ) : (
                  <Play size={20} color="#94A3B8" />
                )}
              </View>
            </View>
            <ProgressBar
              progress={stats?.todayCompleted || 0}
              total={stats?.todayGoal || 5}
              gradientColors={(() => {
                const completed = stats?.todayCompleted || 0;
                const goal = stats?.todayGoal || 5;
                if (completed >= goal) {
                  return ['#10B981', '#34D399'] as const;
                }
                return ['#4F46E5', '#6366F1'] as const;
              })()}
            />
            <View style={styles.progressPercentage}>
              <ThemedText variant="muted">{Math.round(((stats?.todayCompleted || 0) / (stats?.todayGoal || 5)) * 100)}% complete</ThemedText>
            </View>
          </Card>
        </Animated.View>

        {/* Accuracy Card */}
        <Animated.View entering={FadeInUp.delay(300)} style={styles.statsRow}>
          <Card style={styles.statCard} padding="md">
            <View style={styles.statIcon}>
              <Target size={24} color="#10B981" />
            </View>
            <AnimatedNumber value={stats?.accuracy || 0} suffix="%" style={styles.statNumber} />
            <ThemedText variant="muted" style={styles.statLabel}>Accuracy</ThemedText>
          </Card>
          <Card style={styles.statCard} padding="md">
            <View style={styles.statIcon}>
              <TrendingUp size={24} color="#F59E0B" />
            </View>
            <AnimatedNumber value={stats?.totalQuestions || 0} style={styles.statNumber} />
            <ThemedText variant="muted" style={styles.statLabel}>Questions Solved</ThemedText>
          </Card>
          <Card style={styles.statCard} padding="md">
            <View style={styles.statIcon}>
              <ThemedText style={{ fontSize: 24 }}>📊</ThemedText>
            </View>
            <AnimatedNumber value={stats?.longestStreak || 0} style={styles.statNumber} />
            <ThemedText variant="muted" style={styles.statLabel}>Best Streak</ThemedText>
          </Card>
        </Animated.View>

        {/* Continue Practice Button */}
        <Animated.View entering={FadeInUp.delay(400)} style={styles.ctaSection}>
          <Button
            title={stats?.todayCompleted >= (stats?.todayGoal || 5) ? "Practice More" : "Continue Practice"}
            onPress={() => router.push('/practice/session')}
            fullWidth
            size="lg"
            rightIcon={<Play size={20} color="#FFFFFF" />}
          />
        </Animated.View>

        {/* Weak Topics */}
        {stats?.weakTopics && stats.weakTopics.length > 0 && (
          <Animated.View entering={FadeInUp.delay(500)} style={styles.section}>
            <ThemedText variant="h3" style={styles.sectionTitle}>Areas to Improve</ThemedText>
            {stats.weakTopics.map((topic, index) => (
              <Card key={index} style={styles.weakTopicCard} padding="md">
                <View style={styles.weakTopicContent}>
                  <View style={styles.weakTopicLeft}>
                    <AlertCircle size={20} color="#F59E0B" />
                    <View style={styles.weakTopicText}>
                      <ThemedText variant="body">{topic.chapter}</ThemedText>
                      <ThemedText variant="muted" style={styles.weakTopicSubject}>{topic.subject}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.accuracyBadge, { backgroundColor: topic.accuracy < 50 ? '#EF4444' : '#F59E0B' }]}>
                    <ThemedText variant="label" style={{ color: '#FFFFFF' }}>{topic.accuracy}%</ThemedText>
                  </View>
                </View>
              </Card>
            ))}
          </Animated.View>
        )}

        {/* Motivation Card */}
        <Animated.View entering={FadeInUp.delay(600)} style={styles.motivationCard}>
          <LinearGradient colors={['rgba(79, 70, 229, 0.1)', 'rgba(124, 58, 237, 0.05)']} style={StyleSheet.absoluteFill}>
            <Card variant="outlined" style={{ backgroundColor: 'transparent', margin: 0, borderWidth: 0 }}>
              <ThemedText style={styles.motivationIcon}>💪</ThemedText>
              <ThemedText variant="body" center style={styles.motivationText}>
                "{dailyQuote}"
              </ThemedText>
            </Card>
          </LinearGradient>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 20 },
  header: { marginBottom: 24 },
  streakCard: { marginBottom: 24 },
  streakContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  streakIcon: { position: 'absolute', right: 0, bottom: -10 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  progressInfo: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  progressNumber: { fontSize: 28, fontWeight: '700', color: '#FFFFFF' },
  progressCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  progressPercentage: { marginTop: 12, alignItems: 'flex-end' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, alignItems: 'center' },
  statIcon: { marginBottom: 8 },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  statLabel: { fontSize: 11 },
  ctaSection: { marginBottom: 24 },
  weakTopicCard: { marginBottom: 8 },
  weakTopicContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weakTopicLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  weakTopicText: { flex: 1 },
  weakTopicSubject: { marginTop: 2 },
  accuracyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  motivationCard: { marginTop: 8, marginBottom: 20 },
  motivationIcon: { fontSize: 32, textAlign: 'center', marginBottom: 12 },
  motivationText: { fontStyle: 'italic', lineHeight: 24 },
});
