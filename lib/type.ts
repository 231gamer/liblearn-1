export type Profile = {
  id: string
  email: string
  username: string | null
  avatar_url: string | null
  xp: number
  level: number
  created_at: string
}

export type Quiz = {
  id: string
  title: string
  description: string | null
  subject: string
  difficulty: 'easy' | 'medium' | 'hard'
  xp_reward: number
  created_at: string
}

export type Question = {
  id: string
  quiz_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  position: number
}

export type QuizAttempt = {
  id: string
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  xp_earned: number
  completed_at: string
}

export type LeaderboardEntry = {
  id: string
  email: string
  username: string | null
  xp: number
  level: number
  rank: number
}