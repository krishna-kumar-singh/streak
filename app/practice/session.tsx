import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, FadeInUp, SlideInRight, withTiming, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { X, Clock, ChevronLeft, Lightbulb, Sparkles, CheckCircle, XCircle } from 'lucide-react-native';
import { Card, Button, Text as ThemedText, ProgressBar, Loading } from '@/components/ui';
import { useAuthStore, usePracticeStore } from '@/shared/store';
import { supabase } from '@/supabase/client';
import type { MCQ } from '@/shared/types';

const { width } = Dimensions.get('window');

export default function PracticeSessionScreen() {
  const insets = useSafeAreaInsets();
  const { profile } = useAuthStore();
  const { dailyQueue, fetchDailyQueue, fetchNextMCQ, submitAnswer, markCompleted, currentIndex } = usePracticeStore();
  const [mcq, setMcq] = useState<MCQ | null>(null);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMCQ();
  }, []);

  useEffect(() => {
    if (!showResult && mcq) {
      const interval = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showResult, startTime, mcq]);

  const loadMCQ = async () => {
    await fetchDailyQueue();
    const nextMCQ = await fetchNextMCQ();
    if (nextMCQ) {
      setMcq(nextMCQ);
      setStartTime(Date.now());
      setTimeElapsed(0);
    } else {
      router.back();
    }
    setLoading(false);
  };

  const handleOptionSelect = useCallback((option: 'A' | 'B' | 'C' | 'D') => {
    if (showResult) return;
    setSelectedOption(option);
  }, [showResult]);

  const handleSubmit = async () => {
    if (!selectedOption || !mcq) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const result = await submitAnswer(mcq.id, selectedOption, timeTaken);

    setIsCorrect(result.isCorrect);
    setShowResult(true);
  };

  const handleNext = async () => {
    if (currentIndex + 1 >= (dailyQueue?.total_questions || profile?.daily_goal || 5)) {
      // Session complete
      router.replace('/(tabs)/home');
      return;
    }
    markCompleted();
    setSelectedOption(null);
    setShowResult(false);
    setShowExplanation(false);
    setIsCorrect(false);
    setTimeElapsed(0);
    setLoading(true);
    await loadMCQ();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <Loading fullScreen message="Loading question..." />;
  if (!mcq) return <Loading fullScreen message="No more questions today!" />;

  const options = [
    { key: 'A' as const, value: mcq.option_a },
    { key: 'B' as const, value: mcq.option_b },
    { key: 'C' as const, value: mcq.option_c },
    { key: 'D' as const, value: mcq.option_d },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0F172A', '#1E293B']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#94A3B8" />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressText}>
            <ThemedText variant="h3">Question {currentIndex + 1}</ThemedText>
            <ThemedText variant="muted">of {dailyQueue?.total_questions || profile?.daily_goal || 5}</ThemedText>
          </View>
          <ProgressBar
            progress={currentIndex}
            total={dailyQueue?.total_questions || profile?.daily_goal || 5}
            showPercentage={false}
            size="sm"
          />
        </View>

        <View style={styles.timer}>
          <Clock size={18} color="#F59E0B" />
          <ThemedText variant="body">{formatTime(timeElapsed)}</ThemedText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Question Card */}
        <Animated.View entering={FadeInDown}>
          <Card variant="elevated" padding="lg" radius="xl" style={styles.questionCard}>
            <View style={styles.questionMeta}>
              <View style={styles.difficultyBadge}>
                <ThemedText variant="label" style={{ color: '#FFFFFF' }}>{mcq.difficulty}</ThemedText>
              </View>
              <View style={styles.subjectBadge}>
                <ThemedText variant="label">{(mcq as any).subjects?.name || 'Subject'}</ThemedText>
              </View>
            </View>
            <ThemedText variant="h3" style={styles.questionText}>{mcq.question}</ThemedText>
          </Card>
        </Animated.View>

        {/* Options */}
        <View style={styles.options}>
          {options.map((option) => {
            const isSelected = selectedOption === option.key;
            const isCorrectOption = mcq.correct_option === option.key;
            const showCorrectness = showResult && isCorrectOption;

            return (
              <Animated.View key={option.key} entering={SlideInRight.delay(options.indexOf(option) * 100)}>
                <TouchableOpacity onPress={() => handleOptionSelect(option.key)} disabled={showResult}>
                  <Card
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionSelected,
                      showCorrectness && styles.optionCorrect,
                      showResult && !isCorrectOption && isSelected && styles.optionWrong,
                    ]}
                    padding="md"
                  >
                    <View style={styles.optionContent}>
                      <View
                        style={[
                          styles.optionLabel,
                          (isSelected || showCorrectness) && styles.optionLabelSelected,
                          showCorrectness && styles.optionLabelCorrect,
                          showResult && !isCorrectOption && isSelected && styles.optionLabelWrong,
                        ]}
                      >
                        <ThemedText variant="h3" style={{ color: isSelected || showCorrectness ? '#FFFFFF' : '#E2E8F0' }}>
                          {option.key}
                        </ThemedText>
                      </View>
                      <ThemedText variant="body" style={{ flex: 1 }}>{option.value}</ThemedText>
                      {showCorrectness && <CheckCircle size={24} color="#10B981" />}
                      {showResult && !isCorrectOption && isSelected && <XCircle size={24} color="#EF4444" />}
                    </View>
                  </Card>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Result Section */}
        {showResult && (
          <Animated.View entering={FadeIn} style={styles.resultSection}>
            <Card variant="gradient" gradientColors={isCorrect ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']} padding="lg" radius="xl">
              <View style={styles.resultContent}>
                {isCorrect ? (
                  <>
                    <ThemedText style={{ fontSize: 40 }}>🎉</ThemedText>
                    <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>Correct!</ThemedText>
                    <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>Great job! Keep it up!</ThemedText>
                  </>
                ) : (
                  <>
                    <ThemedText style={{ fontSize: 40 }}>😔</ThemedText>
                    <ThemedText variant="h2" style={{ color: '#FFFFFF' }}>Incorrect</ThemedText>
                    <ThemedText variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>The correct answer is {mcq.correct_option}</ThemedText>
                  </>
                )}
              </View>
            </Card>

            {!showExplanation && (
              <TouchableOpacity onPress={() => setShowExplanation(true)} style={styles.explanationToggle}>
                <View style={styles.explanationButton}>
                  <Lightbulb size={20} color="#F59E0B" />
                  <ThemedText variant="body" style={{ color: '#F59E0B', marginLeft: 8 }}>View Explanation</ThemedText>
                </View>
              </TouchableOpacity>
            )}

            {showExplanation && (
              <Animated.View entering={FadeIn} style={styles.explanationCard}>
                <Card padding="lg">
                  <ThemedText variant="h3" style={{ marginBottom: 8 }}>Explanation</ThemedText>
                  <ThemedText variant="muted">{mcq.explanation}</ThemedText>
                  {profile?.plan === 'premium' && (
                    <TouchableOpacity style={styles.aiButton}>
                      <View style={styles.aiButtonContent}>
                        <Sparkles size={18} color="#4F46E5" />
                        <ThemedText variant="body">Explain Further with AI</ThemedText>
                      </View>
                    </TouchableOpacity>
                  )}
                </Card>
              </Animated.View>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
        {!showResult ? (
          <Button
            title="Submit Answer"
            onPress={handleSubmit}
            fullWidth
            size="lg"
            disabled={!selectedOption}
          />
        ) : (
          <Button
            title={currentIndex + 1 >= (dailyQueue?.total_questions || 5) ? "Finish" : "Next Question"}
            onPress={handleNext}
            fullWidth
            size="lg"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: { padding: 8 },
  progressContainer: { flex: 1, marginHorizontal: 16 },
  progressText: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  timer: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  content: { paddingHorizontal: 20 },
  questionCard: { marginBottom: 24 },
  questionMeta: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  difficultyBadge: { backgroundColor: '#4F46E5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  subjectBadge: { backgroundColor: '#374151', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  questionText: { lineHeight: 28 },
  options: { gap: 12 },
  optionCard: { borderWidth: 1.5, borderColor: 'transparent' },
  optionSelected: { borderColor: '#4F46E5', backgroundColor: 'rgba(79, 70, 229, 0.1)' },
  optionCorrect: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  optionWrong: { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  optionContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLabel: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  optionLabelSelected: { backgroundColor: '#4F46E5' },
  optionLabelCorrect: { backgroundColor: '#10B981' },
  optionLabelWrong: { backgroundColor: '#EF4444' },
  resultSection: { marginTop: 24 },
  resultContent: { alignItems: 'center', gap: 8 },
  explanationToggle: { marginTop: 16, alignItems: 'center' },
  explanationButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 12 },
  explanationCard: { marginTop: 16 },
  aiButton: { marginTop: 16, padding: 12, backgroundColor: 'rgba(79, 70, 229, 0.1)', borderRadius: 12 },
  aiButtonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  bottomActions: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', paddingHorizontal: 20, paddingTop: 16 },
});
