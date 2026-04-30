'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitQuiz(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const quizId = formData.get('quiz_id') as string
  const totalQuestions = parseInt(formData.get('total_questions') as string)

  // Fetch correct answers for this quiz
  const { data: questions } = await supabase
    .from('questions')
    .select('id, correct_answer')
    .eq('quiz_id', quizId)

  if (!questions) redirect('/quiz')

  // Calculate score
  let score = 0
  questions.forEach((q) => {
    const userAnswer = formData.get(`answer_${q.id}`) as string
    if (userAnswer === q.correct_answer) score++
  })

  // Calculate XP earned (proportional to score)
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('xp_reward')
    .eq('id', quizId)
    .single()

  const xpEarned = Math.round((score / totalQuestions) * (quiz?.xp_reward ?? 10))

  // Save attempt
  await supabase.from('quiz_attempts').insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    total_questions: totalQuestions,
    xp_earned: xpEarned,
  })

  // Update profile XP and level
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single()

  const newXp = (profile?.xp ?? 0) + xpEarned
  const newLevel = Math.floor(newXp / 100) + 1

  await supabase
    .from('profiles')
    .update({ xp: newXp, level: newLevel })
    .eq('id', user.id)

  redirect(`/quiz/${quizId}/result?score=${score}&total=${totalQuestions}&xp=${xpEarned}`)
}