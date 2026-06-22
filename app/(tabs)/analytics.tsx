import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { Lock, TrendingUp, Calendar, Target, BookOpen } from 'lucide-react-native';
import { Card, Text as ThemedText, Loading, Button } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { supabase } from '@/supabase/client';

const { width } = Dimensions.get('window');

interface AnalyticsData {
  accuracy: number;
  totalQuestions: number;
  correctAnswers: number;
  streak: number;
  longestStreak: number;
  weeklyData: { label: string; value: number; accuracy: number }[];
  subjectBreakdown: { name: string; correct: number; total: number }[];
}

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    // Get last 7 days analytics
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const { data: weekAnalytics } = await supabase
      .from('analytics')
      .select('*')
      .eq('user_id', userId)
      .gte('date', sevenDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    // Get all attempts
    const { data: allAttempts } = await supabase
      .from('attempts')
      .select('is_correct')
      .eq('user_id', userId);

    const totalQuestions = allAttempts?.length || 0;
    const correctAnswers = allAttempts?.filter(a => a.is_correct).length || 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Build weekly chart data
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyData = weekDays.map((day, index) => {
      const dayData = weekAnalytics?.find(a => {
        const d = new Date(a.date);
        return d.getDay() === (index + 1) % 7;
      });
      return { label: day, value: dayData?.total_questions || 0, accuracy: dayData?.accuracy_percentage || 0 };
    });

    setAnalytics({
      accuracy,
      totalQuestions,
      correctAnswers,
      streak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      weeklyData,
      subjectBreakdown: [],
    });

    setLoading(false);
  };

  if (loading) return <Loading fullScreen message="Loading analytics..." />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 20 }]}
      >
        <Animated.View entering={FadeInDown} style={styles.header}>
          <ThemedText variant="h1">Analytics</ThemedText>
          <ThemedText variant="muted">Track your progress</ThemedText>
        </Animated.View>

        {/* Stats Overview */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.statsGrid}>
          <Card style={styles.statCard} padding="lg">
            <TrendingUp size={24} color="#4F46E5" />
            <ThemedText variant="h1" style={styles.statValue}>{analytics?.accuracy || 0}%</ThemedText>
            <ThemedText variant="muted">Overall Accuracy</ThemedText>
          </Card>
          <Card style={styles.statCard} padding="lg">
            <Target size={24} color="#10B981" />
            <ThemedText variant="h1" style={styles.statValue}>{analytics?.totalQuestions || 0}</ThemedText>
            <ThemedText variant="muted">Questions Solved</ThemedText>
          </Card>
          <Card style={styles.statCard} padding="lg">
            <Calendar size={24} color="#F59E0B" />
            <ThemedText variant="h1" style={styles.statValue}>{analytics?.streak || 0}</ThemedText>
            <ThemedText variant="muted">Day Streak</ThemedText>
          </Card>
          <Card style={styles.statCard} padding="lg">
            <BookOpen size={24} color="#7C3AED" />
            <ThemedText variant="h1" style={styles.statValue}>{analytics?.longestStreak || 0}</ThemedText>
            <ThemedText variant="muted">Best Streak</ThemedText>
          </Card>
        </Animated.View>

        {/* Weekly Activity Chart */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Weekly Activity</ThemedText>
          <Card padding="lg" style={styles.chartCard}>
            <BarChart
              data={analytics?.weeklyData.map((d, i) => ({
                value: d.value,
                label: d.label,
                frontColor: d.value > 0 ? '#4F46E5' : '#374151',
              })) || []}
              barWidth={32}
              spacing={16}
              initialSpacing={8}
              yAxisThickness={1}
              yAxisColor="#374151"
              xAxisColor="#374151"
              noOfSections={5}
              maxValue={Math.max(...(analytics?.weeklyData.map(d => d.value) || [5])) + 2}
              yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              showFractionalValues={false}
            />
          </Card>
        </Animated.View>

        {/* Accuracy Trend */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Accuracy Trend</ThemedText>
          <Card padding="lg" style={styles.chartCard}>
            <LineChart
              data={analytics?.weeklyData.map((d, i) => ({
                value: d.accuracy,
                dataPointColor: '#10B981',
                text: `${d.accuracy}%`,
              })) || []}
              width={(width - 88)}
              height={160}
              maxValue={100}
              noOfSections={4}
              spacing={(width - 120) / 7}
              color="#10B981"
              thickness={3}
              dataPointsHeight={6}
              dataPointsColor="#10B981"
              yAxisTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              xAxisLabelTextStyle={{ color: '#94A3B8', fontSize: 10 }}
              yAxisColor="#374151"
              xAxisColor="#374151"
              curved
            />
          </Card>
        </Animated.View>

        {/* Premium Analytics Card */}
        <Animated.View entering={FadeIn.delay(400)} style={styles.section}>
          <Card variant="gradient" gradientColors={['rgba(124, 58, 237, 0.3)', 'rgba(79, 70, 229, 0.2)']} padding="lg" radius="xl">
            <View style={styles.premiumContent}>
              <View style={styles.premiumLeft}>
                <Lock size={32} color="#F59E0B" />
                <View style={styles.premiumText}>
                  <ThemedText variant="h3">Unlock Advanced Analytics</ThemedText>
                  <ThemedText variant="muted" style={{ marginTop: 4 }}>
                    Topic mastery, error patterns, time analysis and more
                  </ThemedText>
                </View>
              </View>
              <Button title="Go Premium" variant="secondary" onPress={() => {}} size="sm" />
            </View>
          </Card>
        </Animated.View>

        {/* Performance Summary */}
        <Animated.View entering={FadeIn.delay(500)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Performance</ThemedText>
          <Card padding="lg">
            <View style={styles.progressBarItem}>
              <ThemedText variant="body">Correct Answers</ThemedText>
              <ThemedText variant="h3" style={{ color: '#10B981' }}>{analytics?.correctAnswers || 0}</ThemedText>
            </View>
            <View style={styles.progressBarItem}>
              <ThemedText variant="body">Wrong Answers</ThemedText>
              <ThemedText variant="h3" style={{ color: '#EF4444' }}>
                {(analytics?.totalQuestions || 0) - (analytics?.correctAnswers || 0)}
              </ThemedText>
            </View>
            <View style={[styles.progressBarItem, { borderTopWidth: 1, borderTopColor: '#374151', marginTop: 12, paddingTop: 12 }]}>
              <ThemedText variant="body" weight="600">Total</ThemedText>
              <ThemedText variant="h2">{analytics?.totalQuestions || 0}</ThemedText>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  statCard: { width: '48%', alignItems: 'center' },
  statValue: { marginTop: 8, marginBottom: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  chartCard: { alignItems: 'center' },
  premiumContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  premiumLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  premiumText: { flex: 1 },
  progressBarItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
});
