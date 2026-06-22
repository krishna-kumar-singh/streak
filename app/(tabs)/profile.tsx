import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Settings, Bell, Shield, FileText, ChevronRight, LogOut, Trash2, Award, TrendingUp, Calendar } from 'lucide-react-native';
import { Card, Avatar, Text as ThemedText, Loading, Button } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { supabase } from '@/supabase/client';

interface UserStats {
  totalQuestions: number;
  accuracy: number;
  streak: number;
  longestStreak: number;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { profile, logout, fetchProfile } = useAuthStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    await fetchProfile();
    await loadStats();
    setLoading(false);
  };

  const loadStats = async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const { data: attempts } = await supabase
      .from('attempts')
      .select('is_correct')
      .eq('user_id', userId);

    const total = attempts?.length || 0;
    const correct = attempts?.filter(a => a.is_correct).length || 0;

    setStats({
      totalQuestions: total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      streak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
    });
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (userId) {
            await supabase.from('profiles').delete().eq('id', userId);
          }
          logout();
        }},
      ]
    );
  };

  if (loading) return <Loading fullScreen message="Loading profile..." />;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20, paddingBottom: 20 }]}
      >
        {/* Profile Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <Avatar
            source={profile?.avatar_url}
            name={profile?.full_name}
            size="xl"
          />
          <ThemedText variant="h1" style={styles.name}>{profile?.full_name}</ThemedText>
          <ThemedText variant="muted">{profile?.email}</ThemedText>
          <View style={styles.planBadge}>
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: profile?.plan === 'premium' ? '#7C3AED' : '#374151', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 }}>
              <Award size={16} color="#FFFFFF" />
              <ThemedText variant="body" style={{ color: '#FFFFFF', fontWeight: '600' }}>
                {profile?.plan === 'premium' ? 'Premium User' : 'Free Plan'}
              </ThemedText>
            </Card>
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.statsSection}>
          <Card padding="lg">
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <TrendingUp size={24} color="#4F46E5" />
                <ThemedText variant="h2">{stats?.accuracy || 0}%</ThemedText>
                <ThemedText variant="muted">Accuracy</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={{ fontSize: 24 }}>📋</ThemedText>
                <ThemedText variant="h2">{stats?.totalQuestions || 0}</ThemedText>
                <ThemedText variant="muted">Questions</ThemedText>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Calendar size={24} color="#F59E0B" />
                <ThemedText variant="h2">{stats?.streak || 0}</ThemedText>
                <ThemedText variant="muted">Streak</ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Exam Details */}
        <Animated.View entering={FadeIn.delay(150)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Your Setup</ThemedText>
          <Card padding="md">
            <View style={styles.detailRow}>
              <ThemedText variant="muted">Exam</ThemedText>
              <ThemedText variant="body">{profile?.exam?.replace('_', ' ').toUpperCase() || 'Not set'}</ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <ThemedText variant="muted">Daily Goal</ThemedText>
              <ThemedText variant="body">{profile?.daily_goal || 5} questions</ThemedText>
            </View>
            <View style={styles.detailDivider} />
            <View style={styles.detailRow}>
              <ThemedText variant="muted">Practice Mode</ThemedText>
              <ThemedText variant="body">{profile?.practice_mode?.replace('_', ' ') || 'Not set'}</ThemedText>
            </View>
          </Card>
        </Animated.View>

        {/* Settings */}
        <Animated.View entering={FadeIn.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Settings</ThemedText>

          <TouchableOpacity onPress={() => router.push('/profile/settings')}>
            <Card style={styles.menuItem} padding="md">
              <View style={styles.menuContent}>
                <Settings size={20} color="#94A3B8" />
                <ThemedText variant="body" style={styles.menuText}>App Settings</ThemedText>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.menuItem} padding="md">
              <View style={styles.menuContent}>
                <Bell size={20} color="#94A3B8" />
                <ThemedText variant="body" style={styles.menuText}>Notifications</ThemedText>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.menuItem} padding="md">
              <View style={styles.menuContent}>
                <Shield size={20} color="#94A3B8" />
                <ThemedText variant="body" style={styles.menuText}>Privacy Policy</ThemedText>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </Card>
          </TouchableOpacity>

          <TouchableOpacity>
            <Card style={styles.menuItem} padding="md">
              <View style={styles.menuContent}>
                <FileText size={20} color="#94A3B8" />
                <ThemedText variant="body" style={styles.menuText}>Terms of Service</ThemedText>
                <ChevronRight size={20} color="#64748B" />
              </View>
            </Card>
          </TouchableOpacity>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeIn.delay(300)} style={styles.section}>
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            leftIcon={<LogOut size={20} color="#EF4444" />}
          />
          <View style={{ marginTop: 12 }}>
            <Button
              title="Delete Account"
              onPress={handleDeleteAccount}
              variant="ghost"
              fullWidth
              leftIcon={<Trash2 size={20} color="#94A3B8" />}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400)} style={styles.footer}>
          <ThemedText variant="muted" center>STREAK v1.0.0</ThemedText>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  scrollContent: { paddingHorizontal: 20 },
  header: { alignItems: 'center', marginBottom: 24 },
  name: { marginTop: 16, marginBottom: 4 },
  planBadge: { marginTop: 16 },
  statsSection: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center', gap: 8 },
  statDivider: { width: 1, height: 48, backgroundColor: '#374151' },
  section: { marginBottom: 24 },
  sectionTitle: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailDivider: { height: 1, backgroundColor: '#374151', marginVertical: 12 },
  menuItem: { marginBottom: 4 },
  menuContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuText: { flex: 1 },
  footer: { marginTop: 24, paddingBottom: 20 },
});
