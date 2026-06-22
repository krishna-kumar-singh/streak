-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  exam TEXT CHECK (exam IN ('class_10_cbse', 'class_12_cbse')),
  selected_subjects TEXT[] DEFAULT '{}',
  selected_chapters TEXT[] DEFAULT '{}',
  practice_mode TEXT CHECK (practice_mode IN ('subject_wise', 'chapter_wise', 'mixed')),
  daily_goal INTEGER DEFAULT 5,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_questions_solved INTEGER DEFAULT 0,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  last_practice_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subjects table (reference data)
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  exam TEXT NOT NULL CHECK (exam IN ('class_10_cbse', 'class_12_cbse')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chapters table (reference data)
CREATE TABLE IF NOT EXISTS chapters (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MCQs table
CREATE TABLE IF NOT EXISTS mcqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam TEXT NOT NULL CHECK (exam IN ('class_10_cbse', 'class_12_cbse')),
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_mcqs_exam ON mcqs(exam);
CREATE INDEX idx_mcqs_subject ON mcqs(subject_id);
CREATE INDEX idx_mcqs_chapter ON mcqs(chapter_id);

-- Attempts table (track user attempts)
CREATE TABLE IF NOT EXISTS attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mcq_id UUID NOT NULL REFERENCES mcqs(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER NOT NULL,
  confidence_score DECIMAL(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for attempts
CREATE INDEX idx_attempts_user ON attempts(user_id);
CREATE INDEX idx_attempts_mcq ON attempts(mcq_id);
CREATE INDEX idx_attempts_created ON attempts(created_at DESC);

-- Daily Queues table (personalized daily questions)
CREATE TABLE IF NOT EXISTS daily_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mcq_ids UUID[] NOT NULL,
  completed_mcq_ids UUID[] DEFAULT '{}',
  total_questions INTEGER NOT NULL DEFAULT 5,
  completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  questions_completed INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Analytics table (daily aggregated analytics)
CREATE TABLE IF NOT EXISTS analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5, 2) DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  subject_breakdown JSONB DEFAULT '{}',
  chapter_breakdown JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'premium')),
  started_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated MCQs table (from PDF uploads)
CREATE TABLE IF NOT EXISTS generated_mcqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pdf_name TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for generated_mcqs
CREATE INDEX idx_generated_mcqs_user ON generated_mcqs(user_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily_reminder', 'streak_risk', 'completion', 'achievement')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read) WHERE read = FALSE;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_mcqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid()::text = id::text);
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid()::text = id::text) WITH CHECK (auth.uid()::text = id::text);
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for subjects (public read)
CREATE POLICY "subjects_read_all" ON subjects FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for chapters (public read)
CREATE POLICY "chapters_read_all" ON chapters FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for mcqs (public read)
CREATE POLICY "mcqs_read_all" ON mcqs FOR SELECT
  TO authenticated USING (true);

-- RLS Policies for attempts
CREATE POLICY "select_own_attempts" ON attempts FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "insert_own_attempts" ON attempts FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for daily_queues
CREATE POLICY "select_own_queues" ON daily_queues FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "insert_own_queues" ON daily_queues FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "update_own_queues" ON daily_queues FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for streaks
CREATE POLICY "select_own_streaks" ON streaks FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "insert_own_streaks" ON streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for analytics
CREATE POLICY "select_own_analytics" ON analytics FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "insert_own_analytics" ON analytics FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "update_own_analytics" ON analytics FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- RLS Policies for subscriptions
CREATE POLICY "select_own_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);

-- RLS Policies for generated_mcqs
CREATE POLICY "select_own_generated" ON generated_mcqs FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "insert_own_generated" ON generated_mcqs FOR INSERT
  TO authenticated WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "delete_own_generated" ON generated_mcqs FOR DELETE
  TO authenticated USING (auth.uid()::text = user_id::text);

-- RLS Policies for notifications
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid()::text = user_id::text);
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid()::text = user_id::text) WITH CHECK (auth.uid()::text = user_id::text);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles table
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default subjects
INSERT INTO subjects (id, name, exam, icon, color) VALUES
('math_10', 'Mathematics', 'class_10_cbse', 'calculator', '#4F46E5'),
('science_10', 'Science', 'class_10_cbse', 'flask-conical', '#7C3AED'),
('english_10', 'English', 'class_10_cbse', 'book-open', '#F59E0B'),
('social_10', 'Social Science', 'class_10_cbse', 'globe', '#10B981'),
('math_12', 'Mathematics', 'class_12_cbse', 'calculator', '#4F46E5'),
('physics_12', 'Physics', 'class_12_cbse', 'atom', '#7C3AED'),
('chemistry_12', 'Chemistry', 'class_12_cbse', 'flask-conical', '#F59E0B'),
('biology_12', 'Biology', 'class_12_cbse', 'dna', '#10B981'),
('english_12', 'English', 'class_12_cbse', 'book-open', '#EF4444')
ON CONFLICT (id) DO NOTHING;

-- Insert chapters for Class 10
INSERT INTO chapters (id, subject_id, name, "order") VALUES
-- Math 10
('math_10_ch1', 'math_10', 'Real Numbers', 1),
('math_10_ch2', 'math_10', 'Polynomials', 2),
('math_10_ch3', 'math_10', 'Pair of Linear Equations', 3),
('math_10_ch4', 'math_10', 'Quadratic Equations', 4),
('math_10_ch5', 'math_10', 'Arithmetic Progressions', 5),
-- Science 10
('science_10_ch1', 'science_10', 'Chemical Reactions', 1),
('science_10_ch2', 'science_10', 'Acids, Bases and Salts', 2),
('science_10_ch3', 'science_10', 'Metals and Non-metals', 3),
('science_10_ch4', 'science_10', 'Carbon Compounds', 4),
('science_10_ch5', 'science_10', 'Life Processes', 5),
-- English 10
('english_10_ch1', 'english_10', 'Reading Comprehension', 1),
('english_10_ch2', 'english_10', 'Grammar - Tenses', 2),
('english_10_ch3', 'english_10', 'Grammar - Voice', 3),
('english_10_ch4', 'english_10', 'Writing Skills', 4),
('english_10_ch5', 'english_10', 'Literature', 5),
-- Social Science 10
('social_10_ch1', 'social_10', 'Rise of Nationalism', 1),
('social_10_ch2', 'social_10', 'National Movement', 2),
('social_10_ch3', 'social_10', 'Resources and Development', 3),
('social_10_ch4', 'social_10', 'Democratic Politics', 4),
('social_10_ch5', 'social_10', 'Economics', 5),
-- Math 12
('math_12_ch1', 'math_12', 'Relations and Functions', 1),
('math_12_ch2', 'math_12', 'Inverse Trigonometric Functions', 2),
('math_12_ch3', 'math_12', 'Matrices', 3),
('math_12_ch4', 'math_12', 'Determinants', 4),
('math_12_ch5', 'math_12', 'Continuity and Differentiability', 5),
-- Physics 12
('physics_12_ch1', 'physics_12', 'Electric Charges and Fields', 1),
('physics_12_ch2', 'physics_12', 'Electrostatic Potential', 2),
('physics_12_ch3', 'physics_12', 'Current Electricity', 3),
('physics_12_ch4', 'physics_12', 'Moving Charges and Magnetism', 4),
('physics_12_ch5', 'physics_12', 'Electromagnetic Induction', 5),
-- Chemistry 12
('chemistry_12_ch1', 'chemistry_12', 'Solutions', 1),
('chemistry_12_ch2', 'chemistry_12', 'Electrochemistry', 2),
('chemistry_12_ch3', 'chemistry_12', 'Chemical Kinetics', 3),
('chemistry_12_ch4', 'chemistry_12', 'Surface Chemistry', 4),
('chemistry_12_ch5', 'chemistry_12', 'General Principles of Isolation', 5),
-- Biology 12
('biology_12_ch1', 'biology_12', 'Reproduction in Organisms', 1),
('biology_12_ch2', 'biology_12', 'Sexual Reproduction', 2),
('biology_12_ch3', 'biology_12', 'Genetics and Evolution', 3),
('biology_12_ch4', 'biology_12', 'Biotechnology Principles', 4),
('biology_12_ch5', 'biology_12', 'Ecology and Environment', 5),
-- English 12
('english_12_ch1', 'english_12', 'Reading Comprehension', 1),
('english_12_ch2', 'english_12', 'Advanced Grammar', 2),
('english_12_ch3', 'english_12', 'Writing Skills', 3),
('english_12_ch4', 'english_12', 'Literature - Flamingo', 4),
('english_12_ch5', 'english_12', 'Literature - Vistas', 5)
ON CONFLICT (id) DO NOTHING;