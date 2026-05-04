import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import QuizClient from './QuizClient'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, subject, difficulty, xp_reward, description')
    .eq('id', id)
    .single()

  if (!quiz) notFound()

  // ✅ SECURITY: correct_answer is intentionally excluded from this query
  const { data: questions } = await supabase
    .from('questions')
    .select('id, quiz_id, question_text, option_a, option_b, option_c, option_d, position')
    .eq('quiz_id', id)
    .order('position', { ascending: true })

  if (!questions || questions.length === 0) notFound()

  // Check if first attempt — show info to user
  const { data: existingAttempt } = await supabase
    .from('quiz_attempts')
    .select('id, score, total_questions')
    .eq('user_id', user.id)
    .eq('quiz_id', id)
    .maybeSingle()

  return (
    <QuizClient
      quiz={quiz}
      questions={questions}
      isFirstAttempt={!existingAttempt}
      previousAttempt={existingAttempt ?? null}
    />
  )
}