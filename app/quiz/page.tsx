import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function QuizListPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, score, total_questions, xp_earned')
    .eq('user_id', user.id)

  // Get the latest attempt per quiz
  const attemptMap = new Map<string, { score: number; total: number; xp: number }>()
  attempts?.forEach((a) => {
    attemptMap.set(a.quiz_id, {
      score: a.score,
      total: a.total_questions,
      xp: a.xp_earned,
    })
  })

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">All Quizzes</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Pick a quiz, answer questions, and earn XP to level up.
        </p>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes?.map((quiz) => {
          const attempt = attemptMap.get(quiz.id)
          const completed = !!attempt

          return (
            <div
              key={quiz.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-4"
            >
              {/* Title + Completed Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white">{quiz.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{quiz.description}</p>
                </div>
                {completed && (
                  <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Done ✓
                  </span>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
                  {quiz.subject}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
                  {quiz.difficulty}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  +{quiz.xp_reward} XP
                </span>
              </div>

              {/* Previous Score */}
              {completed && attempt && (
                <div className="bg-gray-800 rounded-xl px-4 py-3 text-sm">
                  <p className="text-gray-400">
                    Last score:{' '}
                    <span className="text-white font-semibold">
                      {attempt.score}/{attempt.total}
                    </span>
                  </p>
                  <p className="text-gray-400">
                    XP earned:{' '}
                    <span className="text-emerald-400 font-semibold">
                      +{attempt.xp}
                    </span>
                  </p>
                </div>
              )}

              {/* CTA */}
              <Link
                href={`/quiz/${quiz.id}`}
                className="mt-auto w-full text-center py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition"
              >
                {completed ? 'Retake Quiz' : 'Start Quiz'}
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}