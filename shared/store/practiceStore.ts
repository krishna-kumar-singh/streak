import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import type { MCQ, DailyQueue, Attempt } from '@/shared/types';

interface PracticeState {
  dailyQueue: DailyQueue | null;
  currentMCQ: MCQ | null;
  currentIndex: number;
  todayCompleted: number;
  todayCorrect: number;
  isLoading: boolean;
  sessionStartTime: number | null;

  generateDailyQueue: () => Promise<void>;
  fetchDailyQueue: () => Promise<void>;
  fetchNextMCQ: () => Promise<MCQ | null>;
  submitAnswer: (mcqId: string, selectedOption: 'A' | 'B' | 'C' | 'D', timeTakenSeconds: number) => Promise<{ isCorrect: boolean }>;
  markCompleted: () => void;
  resetSession: () => void;
}

export const usePracticeStore = create<PracticeState>((set, get) => ({
  dailyQueue: null,
  currentMCQ: null,
  currentIndex: 0,
  todayCompleted: 0,
  todayCorrect: 0,
  isLoading: false,
  sessionStartTime: null,

  generateDailyQueue: async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    // Check if queue exists
    const { data: existingQueue } = await supabase
      .from('daily_queues')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existingQueue) {
      set({ dailyQueue: existingQueue });
      return;
    }

    // Get user's profile for preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) return;

    // Retention engine logic - prioritize:
    // 1. Previously wrong questions
    // 2. Weak topics (low accuracy)
    // 3. Long unseen questions
    // 4. New questions

    const mcqIds: string[] = [];

    // 1. Get wrong questions from attempts
    const { data: wrongAttempts } = await supabase
      .from('attempts')
      .select('mcq_id')
      .eq('user_id', userId)
      .eq('is_correct', false)
      .order('created_at', { ascending: false })
      .limit(2);

    if (wrongAttempts?.length) {
      mcqIds.push(...wrongAttempts.map(a => a.mcq_id));
    }

    // 2. Get remaining questions from user's subjects/chapters
    const remaining = profile.daily_goal - mcqIds.length;

    if (remaining > 0) {
      let query = supabase
        .from('mcqs')
        .select('id')
        .eq('exam', profile.exam);

      if (profile.practice_mode === 'subject_wise' && profile.selected_subjects?.length) {
        query = query.in('subject_id', profile.selected_subjects);
      } else if (profile.practice_mode === 'chapter_wise' && profile.selected_chapters?.length) {
        query = query.in('chapter_id', profile.selected_chapters);
      }

      const { data: availableMcqs } = await query.limit(remaining * 3);

      if (availableMcqs?.length) {
        // Randomly select
        const shuffled = availableMcqs.sort(() => Math.random() - 0.5);
        mcqIds.push(...shuffled.slice(0, remaining).map(m => m.id));
      }
    }

    // Create daily queue
    const { data: newQueue, error } = await supabase
      .from('daily_queues')
      .insert({
        user_id: userId,
        date: today,
        mcq_ids: mcqIds,
        completed_mcq_ids: [],
        total_questions: mcqIds.length,
        completed: 0,
      })
      .select()
      .single();

    if (!error && newQueue) {
      set({ dailyQueue: newQueue });
    }
  },

  fetchDailyQueue: async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: queue } = await supabase
      .from('daily_queues')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    set({ dailyQueue: queue });
  },

  fetchNextMCQ: async () => {
    const { dailyQueue, currentIndex } = get();
    if (!dailyQueue || currentIndex >= dailyQueue.mcq_ids.length) return null;

    const mcqId = dailyQueue.mcq_ids[currentIndex];
    if (!mcqId) return null;

    const { data: mcq } = await supabase
      .from('mcqs')
      .select(`
        *,
        subjects (name, color),
        chapters (name)
      `)
      .eq('id', mcqId)
      .single();

    set({ currentMCQ: mcq, sessionStartTime: Date.now() });
    return mcq;
  },

  submitAnswer: async (mcqId, selectedOption, timeTakenSeconds) => {
    const { currentMCQ, dailyQueue, todayCorrect } = get();
    if (!currentMCQ || !dailyQueue) {
      return { isCorrect: false };
    }

    const isCorrect = selectedOption === currentMCQ.correct_option;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return { isCorrect: false };

    // Record attempt
    await supabase.from('attempts').insert({
      user_id: userId,
      mcq_id: mcqId,
      selected_option: selectedOption,
      is_correct: isCorrect,
      time_taken_seconds: timeTakenSeconds,
    });

    // Update queue
    const completedMcqIds = [...dailyQueue.completed_mcq_ids, mcqId];
    await supabase
      .from('daily_queues')
      .update({
        completed_mcq_ids: completedMcqIds,
        completed: completedMcqIds.length,
      })
      .eq('id', dailyQueue.id);

    set({
      dailyQueue: { ...dailyQueue, completed_mcq_ids: completedMcqIds, completed: completedMcqIds.length },
      todayCompleted: completedMcqIds.length,
      todayCorrect: todayCorrect + (isCorrect ? 1 : 0),
    });

    return { isCorrect };
  },

  markCompleted: () => {
    const { currentIndex } = get();
    set({ currentIndex: currentIndex + 1, currentMCQ: null, sessionStartTime: null });
  },

  resetSession: () => {
    set({
      currentMCQ: null,
      currentIndex: 0,
      sessionStartTime: null,
    });
  },
}));
