export type Exam = 'class_10_cbse' | 'class_12_cbse';

export type PracticeMode = 'subject_wise' | 'chapter_wise' | 'mixed';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type Plan = 'free' | 'premium';

export interface Subject {
  id: string;
  name: string;
  exam: Exam;
  icon: string;
  color: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  subject_id: string;
  name: string;
  order: number;
}

export interface MCQ {
  id: string;
  exam: Exam;
  subject_id: string;
  chapter_id: string;
  difficulty: Difficulty;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  tags: string[];
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  exam?: Exam;
  selected_subjects?: string[];
  selected_chapters?: string[];
  practice_mode?: PracticeMode;
  daily_goal?: number;
  current_streak: number;
  longest_streak: number;
  total_questions_solved: number;
  plan: Plan;
  created_at: string;
  updated_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  mcq_id: string;
  selected_option: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  time_taken_seconds: number;
  confidence_score?: number;
  created_at: string;
}

export interface DailyQueue {
  id: string;
  user_id: string;
  date: string;
  mcq_ids: string[];
  completed_mcq_ids: string[];
  total_questions: number;
  completed: number;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  date: string;
  questions_completed: number;
  accuracy_percentage: number;
  created_at: string;
}

export interface Analytics {
  id: string;
  user_id: string;
  date: string;
  total_questions: number;
  correct_answers: number;
  incorrect_answers: number;
  accuracy_percentage: number;
  time_spent_minutes: number;
  subject_breakdown: Record<string, { correct: number; total: number }>;
  chapter_breakdown: Record<string, { correct: number; total: number }>;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: Plan;
  started_at: string;
  expires_at: string;
  auto_renew: boolean;
  created_at: string;
}

export interface GeneratedMCQ {
  id: string;
  user_id: string;
  pdf_name: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'daily_reminder' | 'streak_risk' | 'completion' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  scheduled_for?: string;
  created_at: string;
}

export interface UserStats {
  currentStreak: number;
  longestStreak: number;
  totalQuestions: number;
  accuracy: number;
  todayCompleted: number;
  todayGoal: number;
  weakTopics: WeakTopic[];
}

export interface WeakTopic {
  chapter_id: string;
  chapter_name: string;
  subject_name: string;
  accuracy: number;
  attempts: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}
