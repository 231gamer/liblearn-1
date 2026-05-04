'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { calculateScore, calculateLevel } from '@/lib/quiz-engine/scorer'
import { validateAnswers } from '@/lib/quiz-engine/validator'

export async function submitQuiz(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const quizId = formData.get('quiz_id') as string
  const totalQuestionsRaw = formData.get('total_questions') as string
  const questionIdsRaw = formData.get('question_ids') as string

  if (!quizId || !totalQuestionsRaw || !questionIdsRaw) redirect('/quiz')

  const questionIds = questionIdsRaw.split(',').filter(Boolean)

  // Validate submitted answers server-side
  const { valid, answers, error } = validateAnswers(formData, questionIds)

  if (!valid) {
    console.error('Answer validation failed:', error)
    redirect('/quiz')
  }

  // Fetch correct answers server-side only — never sent to client
  const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('quiz_id', quizId)
    .in('id', questionIds)

  if (!questions || questions.length === 0) redirect('/quiz')

  const correctAnswers: Record<string, string> = {}
  for (const q of questions) {
    correctAnswers[q.id] = q.correct_answer
  }

  // Fetch quiz XP reward
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('xp_reward')
    .eq('id', quizId)
    .single()

  // Check for best previous attempt
  const { data: bestPrevious } = await supabase
    .from('quiz_attempts')
    .select('xp_earned')
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)
    .order('xp_earned', { ascending: false })
    .limit(1)
    .maybeSingle()

  const isFirstAttempt = !bestPrevious
  const bestPreviousXp = bestPrevious?.xp_earned ?? 0

  // Calculate score using centralized engine
  // Always pass isFirstAttempt=true to get the raw XP value
  // We'll handle the best-score logic ourselves below
  const result = calculateScore({
    answers,
    correctAnswers,
    xpReward: quiz?.xp_reward ?? 10,
    isFirstAttempt: true, // calculate raw XP always
  })

  // Best-score XP logic:
  // If this attempt earned more than the best previous → award the DIFFERENCE
  // If this attempt earned less or equal → award 0 (no regression)
  let xpToAward = 0
  if (result.xpEarned > bestPreviousXp) {
    xpToAward = result.xpEarned - bestPreviousXp
  }

  // Save attempt with actual XP earned this attempt (for records)
  await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    score: result.score,
    total_questions: result.total,
    xp_earned: result.xpEarned,
  })

  // Only update profile XP if there is a positive delta
  if (xpToAward > 0) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single()

    const newXp = (profile?.xp ?? 0) + xpToAward
    const newLevel = calculateLevel(newXp)

    await supabase
      .from('profiles')
      .update({ xp: newXp, level: newLevel })
      .eq('id', user.id)
  }

  redirect(
    `/quiz/${quizId}/result?score=${result.score}&total=${result.total}&xp=${xpToAward}&first=${isFirstAttempt ? '1' : '0'}&perfect=${result.isPerfect ? '1' : '0'}`
  )
}