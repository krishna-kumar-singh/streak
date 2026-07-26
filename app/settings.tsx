import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowLeft, Bell, RefreshCw, Check, Target } from 'lucide-react-native';
import { Button, Card, Text as ThemedText } from '@/components/ui';
import { useAuthStore } from '@/shared/store';
import { DAILY_GOAL_OPTIONS } from '@/shared/constants';
import { useNotifications } from '@/shared/hooks/useNotifications';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { profile, updateProfile } = useAuthStore();
  const { scheduleDailyReminder } = useNotifications();

  const [dailyGoal, setDailyGoal] = useState<number>(profile?.daily_goal || 5);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleGoalChange = (newGoal: number) => {
    setDailyGoal(newGoal);
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotificationsEnabled(val);
    if (val) {
      const scheduled = await scheduleDailyReminder(19, 0);
      if (!scheduled) {
        Alert.alert('Notifications Disabled', 'Please enable notification permissions in system settings.');
        setNotificationsEnabled(false);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateProfile({ daily_goal: dailyGoal });
    setIsSaving(false);
    Alert.alert('Settings Updated', 'Your preferences have been saved successfully.');
    router.back();
  };

  const handleReOnboard = () => {
    Alert.alert(
      'Re-configure Exam Setup',
      'Would you like to change your exam, target subjects, or chapters?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Re-configure', onPress: () => router.push('/onboarding/step1') },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>Settings</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Daily Goal */}
        <Animated.View entering={FadeInDown} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Daily Question Goal</ThemedText>
          <View style={styles.goalList}>
            {DAILY_GOAL_OPTIONS.map((opt) => {
              const isSelected = dailyGoal === opt.value;
              return (
                <TouchableOpacity key={opt.value} onPress={() => handleGoalChange(opt.value)}>
                  <Card style={[styles.goalCard, isSelected && styles.goalCardActive]} padding="md">
                    <View style={styles.goalRow}>
                      <Target size={20} color={isSelected ? '#4F46E5' : '#94A3B8'} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <ThemedText variant="body" style={{ fontWeight: '600', color: '#FFFFFF' }}>{opt.label}</ThemedText>
                        <ThemedText variant="muted">{opt.description}</ThemedText>
                      </View>
                      {isSelected && <Check size={20} color="#4F46E5" />}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Notifications */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Notifications</ThemedText>
          <Card padding="md">
            <View style={styles.settingRow}>
              <Bell size={20} color="#94A3B8" />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <ThemedText variant="body" style={{ fontWeight: '600', color: '#FFFFFF' }}>Daily Reminder</ThemedText>
                <ThemedText variant="muted">Receive daily practice reminder at 7:00 PM</ThemedText>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: '#334155', true: '#4F46E5' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </Card>
        </Animated.View>

        {/* Re-onboard */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <ThemedText variant="h3" style={styles.sectionTitle}>Exam Preferences</ThemedText>
          <TouchableOpacity onPress={handleReOnboard}>
            <Card padding="md">
              <View style={styles.settingRow}>
                <RefreshCw size={20} color="#94A3B8" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText variant="body" style={{ fontWeight: '600', color: '#FFFFFF' }}>Re-configure Exam Setup</ThemedText>
                  <ThemedText variant="muted">Change your current exam, subjects, or chapters</ThemedText>
                </View>
              </View>
            </Card>
          </TouchableOpacity>
        </Animated.View>

        {/* Save Button */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.cta}>
          <Button
            title="Save Settings"
            onPress={handleSave}
            fullWidth
            size="lg"
            loading={isSaving}
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
  sectionTitle: { marginBottom: 12 },
  goalList: { gap: 10 },
  goalCard: { borderWidth: 1, borderColor: 'transparent' },
  goalCardActive: { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  goalRow: { flexDirection: 'row', alignItems: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  cta: { marginTop: 12, marginBottom: 40 },
});
