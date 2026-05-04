'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ── Guard: verify admin on every action ──────────────────────────
async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return { supabase, user }
}

// ── Create Quiz ───────────────────────────────────────────────────
export async function createQuiz(formData: FormData) {
  const { supabase } = await requireAdmin()

  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const subject = (formData.get('subject') as string)?.trim()
  const difficulty = formData.get('difficulty') as string
  const xp_reward = parseInt(formData.get('xp_reward') as string)

  if (!title || !subject || !difficulty || isNaN(xp_reward)) {
    redirect('/admin/quizzes/new?error=All+fields+are+required')
  }

  if (!['easy', 'medium', 'hard'].includes(difficulty)) {
    redirect('/admin/quizzes/new?error=Invalid+difficulty')
  }

  if (xp_reward < 1 || xp_reward > 500) {
    redirect('/admin/quizzes/new?error=XP+reward+must+be+between+1+and+500')
  }

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .insert({ title, description, subject, difficulty, xp_reward })
    .select('id')
    .single()

  if (error || !quiz) {
    redirect('/admin/quizzes/new?error=Failed+to+create+quiz')
  }

  revalidatePath('/admin')
  revalidatePath('/admin/quizzes')
  revalidatePath('/quiz')
  redirect(`/admin/quizzes/${quiz.id}/questions?message=Quiz+created!+Now+add+questions.`)
}

// ── Delete Quiz ───────────────────────────────────────────────────
export async function deleteQuiz(formData: FormData) {
  const { supabase } = await requireAdmin()

  const quizId = formData.get('quiz_id') as string
  if (!quizId) redirect('/admin/quizzes')

  await supabase.from('quizzes').delete().eq('id', quizId)

  revalidatePath('/admin')
  revalidatePath('/admin/quizzes')
  revalidatePath('/quiz')
  redirect('/admin/quizzes?message=Quiz+deleted')
}

// ── Add Question ──────────────────────────────────────────────────
export async function addQuestion(formData: FormData) {
  const { supabase } = await requireAdmin()

  const quiz_id = formData.get('quiz_id') as string
  const question_text = (formData.get('question_text') as string)?.trim()
  const option_a = (formData.get('option_a') as string)?.trim()
  const option_b = (formData.get('option_b') as string)?.trim()
  const option_c = (formData.get('option_c') as string)?.trim()
  const option_d = (formData.get('option_d') as string)?.trim()
  const correct_answer = formData.get('correct_answer') as string
  const positionRaw = formData.get('position') as string
  const position = parseInt(positionRaw)

  if (
    !quiz_id ||
    !question_text ||
    !option_a ||
    !option_b ||
    !option_c ||
    !option_d ||
    !correct_answer
  ) {
    redirect(
      `/admin/quizzes/${quiz_id}/questions?error=All+fields+are+required`
    )
  }

  if (!['a', 'b', 'c', 'd'].includes(correct_answer)) {
    redirect(
      `/admin/quizzes/${quiz_id}/questions?error=Invalid+correct+answer`
    )
  }

  const { error } = await supabase.from('questions').insert({
    quiz_id,
    question_text,
    option_a,
    option_b,
    option_c,
    option_d,
    correct_answer,
    position: isNaN(position) ? 0 : position,
  })

  if (error) {
    redirect(
      `/admin/quizzes/${quiz_id}/questions?error=Failed+to+add+question`
    )
  }

  revalidatePath(`/admin/quizzes/${quiz_id}/questions`)
  revalidatePath('/quiz')
  redirect(
    `/admin/quizzes/${quiz_id}/questions?message=Question+added+successfully`
  )
}

// ── Delete Question ───────────────────────────────────────────────
export async function deleteQuestion(formData: FormData) {
  const { supabase } = await requireAdmin()

  const question_id = formData.get('question_id') as string
  const quiz_id = formData.get('quiz_id') as string

  if (!question_id || !quiz_id) redirect('/admin')

  await supabase.from('questions').delete().eq('id', question_id)

  revalidatePath(`/admin/quizzes/${quiz_id}/questions`)
  revalidatePath('/quiz')
  redirect(
    `/admin/quizzes/${quiz_id}/questions?message=Question+deleted`
  )
}