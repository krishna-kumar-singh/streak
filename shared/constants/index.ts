export const SUBJECTS = {
  class_10_cbse: [
    { id: 'math_10', name: 'Mathematics', icon: 'calculator', color: '#4F46E5' },
    { id: 'science_10', name: 'Science', icon: 'flask-conical', color: '#7C3AED' },
    { id: 'english_10', name: 'English', icon: 'book-open', color: '#F59E0B' },
    { id: 'social_10', name: 'Social Science', icon: 'globe', color: '#10B981' },
  ],
  class_12_cbse: [
    { id: 'math_12', name: 'Mathematics', icon: 'calculator', color: '#4F46E5' },
    { id: 'physics_12', name: 'Physics', icon: 'atom', color: '#7C3AED' },
    { id: 'chemistry_12', name: 'Chemistry', icon: 'flask-conical', color: '#F59E0B' },
    { id: 'biology_12', name: 'Biology', icon: 'dna', color: '#10B981' },
    { id: 'english_12', name: 'English', icon: 'book-open', color: '#EF4444' },
  ],
};

export const CHAPTERS = {
  math_10: [
    { id: 'math_10_ch1', name: 'Real Numbers', order: 1 },
    { id: 'math_10_ch2', name: 'Polynomials', order: 2 },
    { id: 'math_10_ch3', name: 'Pair of Linear Equations', order: 3 },
    { id: 'math_10_ch4', name: 'Quadratic Equations', order: 4 },
    { id: 'math_10_ch5', name: 'Arithmetic Progressions', order: 5 },
  ],
  science_10: [
    { id: 'science_10_ch1', name: 'Chemical Reactions', order: 1 },
    { id: 'science_10_ch2', name: 'Acids, Bases and Salts', order: 2 },
    { id: 'science_10_ch3', name: 'Metals and Non-metals', order: 3 },
    { id: 'science_10_ch4', name: 'Carbon Compounds', order: 4 },
    { id: 'science_10_ch5', name: 'Life Processes', order: 5 },
  ],
  english_10: [
    { id: 'english_10_ch1', name: 'Reading Comprehension', order: 1 },
    { id: 'english_10_ch2', name: 'Grammar - Tenses', order: 2 },
    { id: 'english_10_ch3', name: 'Grammar - Voice', order: 3 },
    { id: 'english_10_ch4', name: 'Writing Skills', order: 4 },
    { id: 'english_10_ch5', name: 'Literature', order: 5 },
  ],
  social_10: [
    { id: 'social_10_ch1', name: 'Rise of Nationalism', order: 1 },
    { id: 'social_10_ch2', name: 'National Movement', order: 2 },
    { id: 'social_10_ch3', name: 'Resources and Development', order: 3 },
    { id: 'social_10_ch4', name: 'Democratic Politics', order: 4 },
    { id: 'social_10_ch5', name: 'Economics', order: 5 },
  ],
  math_12: [
    { id: 'math_12_ch1', name: 'Relations and Functions', order: 1 },
    { id: 'math_12_ch2', name: 'Inverse Trigonometric Functions', order: 2 },
    { id: 'math_12_ch3', name: 'Matrices', order: 3 },
    { id: 'math_12_ch4', name: 'Determinants', order: 4 },
    { id: 'math_12_ch5', name: 'Continuity and Differentiability', order: 5 },
  ],
  physics_12: [
    { id: 'physics_12_ch1', name: 'Electric Charges and Fields', order: 1 },
    { id: 'physics_12_ch2', name: 'Electrostatic Potential', order: 2 },
    { id: 'physics_12_ch3', name: 'Current Electricity', order: 3 },
    { id: 'physics_12_ch4', name: 'Moving Charges and Magnetism', order: 4 },
    { id: 'physics_12_ch5', name: 'Electromagnetic Induction', order: 5 },
  ],
  chemistry_12: [
    { id: 'chemistry_12_ch1', name: 'Solutions', order: 1 },
    { id: 'chemistry_12_ch2', name: 'Electrochemistry', order: 2 },
    { id: 'chemistry_12_ch3', name: 'Chemical Kinetics', order: 3 },
    { id: 'chemistry_12_ch4', name: 'Surface Chemistry', order: 4 },
    { id: 'chemistry_12_ch5', name: 'General Principles of Isolation', order: 5 },
  ],
  biology_12: [
    { id: 'biology_12_ch1', name: 'Reproduction in Organisms', order: 1 },
    { id: 'biology_12_ch2', name: 'Sexual Reproduction', order: 2 },
    { id: 'biology_12_ch3', name: 'Genetics and Evolution', order: 3 },
    { id: 'biology_12_ch4', name: 'Biotechnology Principles', order: 4 },
    { id: 'biology_12_ch5', name: 'Ecology and Environment', order: 5 },
  ],
  english_12: [
    { id: 'english_12_ch1', name: 'Reading Comprehension', order: 1 },
    { id: 'english_12_ch2', name: 'Advanced Grammar', order: 2 },
    { id: 'english_12_ch3', name: 'Writing Skills', order: 3 },
    { id: 'english_12_ch4', name: 'Literature - Flamingo', order: 4 },
    { id: 'english_12_ch5', name: 'Literature - Vistas', order: 5 },
  ],
};

export const DAILY_GOAL_OPTIONS = [
  { value: 5, label: '5 Questions', description: 'Quick daily practice (~10 min)' },
  { value: 10, label: '10 Questions', description: 'Standard practice (~20 min)' },
  { value: 15, label: '15 Questions', description: 'Intensive practice (~30 min)' },
];

export const MOTIVATIONAL_QUOTES = [
  'Small steps every day lead to big results.',
  'Consistency is the key to success.',
  'Every question you practice makes you stronger.',
  'Your future self will thank you for practicing today.',
  'Progress, not perfection.',
  'One day at a time, one question at a time.',
  'Success is built one question at a time.',
  "The secret of getting ahead is getting started.",
  'Practice makes progress.',
  'Your dedication today creates your success tomorrow.',
];

export const COLORS = {
  primary: '#4F46E5',
  secondary: '#7C3AED',
  accent: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  background: '#0F172A',
  card: '#1E293B',
  text: '#FFFFFF',
  muted: '#94A3B8',
};

export const ANIMATION_CONFIG = {
  spring: {
    damping: 15,
    stiffness: 150,
  },
  timing: {
    duration: 300,
  },
};
