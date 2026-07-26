import { create } from 'zustand';
import { supabase } from '@/supabase/client';
import type { MCQ, DailyQueue, Attempt } from '@/shared/types';
import { HARDCODED_MCQS } from '@/shared/constants/questions';

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
    const userId = (await supabase.auth.getUser()).data.user?.id || 'local-guest';
    const today = new Date().toISOString().split('T')[0];

    // Check if queue exists
    try {
      const { data: existingQueue } = await supabase
        .from('daily_queues')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (existingQueue && existingQueue.mcq_ids?.length > 0) {
        set({ dailyQueue: existingQueue });
        return;
      }
    } catch (e) {
      // Continue to fallback queue generation
    }

    // Get user's profile for preferences
    let profileExam = 'class_10_cbse';
    let dailyGoal = 5;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (profile) {
        profileExam = profile.exam || 'class_10_cbse';
        dailyGoal = profile.daily_goal || 5;
      }
    } catch (e) {}

    // Fetch matching MCQs from Supabase or fallback
    let mcqIds: string[] = [];
    try {
      const { data: availableMcqs } = await supabase
        .from('mcqs')
        .select('id')
        .eq('exam', profileExam)
        .limit(dailyGoal * 2);

      if (availableMcqs && availableMcqs.length > 0) {
        mcqIds = availableMcqs.map(m => m.id);
      }
    } catch (e) {}

    // Fallback to hardcoded MCQs if database has no records
    if (mcqIds.length === 0) {
      const filtered = HARDCODED_MCQS.filter(m => m.exam === profileExam);
      const fallbackList = filtered.length > 0 ? filtered : HARDCODED_MCQS;
      mcqIds = fallbackList.slice(0, dailyGoal).map(m => m.id);
    }

    const localQueue: DailyQueue = {
      id: `queue-${today}`,
      user_id: userId,
      date: today,
      mcq_ids: mcqIds,
      completed_mcq_ids: [],
      total_questions: mcqIds.length,
      completed: 0,
      created_at: new Date().toISOString(),
    };

    try {
      await supabase.from('daily_queues').insert(localQueue);
    } catch (e) {}

    set({ dailyQueue: localQueue });
  },

  fetchDailyQueue: async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id || 'local-guest';
    const today = new Date().toISOString().split('T')[0];

    try {
      const { data: queue } = await supabase
        .from('daily_queues')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (queue) {
        set({ dailyQueue: queue });
        return;
      }
    } catch (e) {}

    // Auto-generate if missing
    await get().generateDailyQueue();
  },

  fetchNextMCQ: async () => {
    const { dailyQueue, currentIndex } = get();
    if (!dailyQueue || currentIndex >= dailyQueue.mcq_ids.length) return null;

    const mcqId = dailyQueue.mcq_ids[currentIndex];
    if (!mcqId) return null;

    // Check Supabase first
    try {
      const { data: mcq } = await supabase
        .from('mcqs')
        .select(`*, subjects (name, color), chapters (name)`)
        .eq('id', mcqId)
        .single();

      if (mcq) {
        set({ currentMCQ: mcq, sessionStartTime: Date.now() });
        return mcq;
      }
    } catch (e) {}

    // Fallback to hardcoded questions
    const hardcoded = HARDCODED_MCQS.find(m => m.id === mcqId) || HARDCODED_MCQS[currentIndex % HARDCODED_MCQS.length];
    set({ currentMCQ: hardcoded, sessionStartTime: Date.now() });
    return hardcoded;
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
