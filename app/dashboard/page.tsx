import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// XP required to reach each level
function xpForNextLevel(level: number): number {
  return level * 100
}

function getLevelProgress(xp: number, level: number): number {
  const previousLevelXp = (level - 1) * 100
  const nextLevelXp = xpForNextLevel(level)
  const progress = ((xp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch all quizzes
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true })

  // Fetch user's attempts
  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id')
    .eq('user_id', user.id)

  const attemptedQuizIds = new Set(attempts?.map((a) => a.quiz_id) ?? [])

  const xp = profile?.xp ?? 0
  const level = profile?.level ?? 1
  const progress = getLevelProgress(xp, level)
  const xpNeeded = xpForNextLevel(level)
  const previousXp = (level - 1) * 100

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          {user.email}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Level Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Current Level</p>
          <p className="text-4xl font-extrabold text-emerald-400">{level}</p>
          <p className="text-xs text-gray-500 mt-1">Keep going!</p>
        </div>

        {/* XP Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total XP</p>
          <p className="text-4xl font-extrabold text-white">{xp}</p>
          <p className="text-xs text-gray-500 mt-1">{xpNeeded - xp} XP to next level</p>
        </div>

        {/* Quizzes Completed */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Quizzes Done</p>
          <p className="text-4xl font-extrabold text-white">{attemptedQuizIds.size}</p>
          <p className="text-xs text-gray-500 mt-1">of {quizzes?.length ?? 0} available</p>
        </div>

      </div>

      {/* XP Progress Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Level {level} Progress</span>
          <span className="text-sm text-gray-400">{xp} / {xpNeeded} XP</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">Level {level} ({previousXp} XP)</span>
          <span className="text-xs text-gray-600">Level {level + 1} ({xpNeeded} XP)</span>
        </div>
      </div>

      {/* Quizzes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Available Quizzes</h2>
          <Link
            href="/quiz"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes?.map((quiz) => {
            const completed = attemptedQuizIds.has(quiz.id)
            return (
              <div
                key={quiz.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{quiz.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{quiz.description}</p>
                  </div>
                  {completed && (
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Done ✓
                    </span>
                  )}
                </div>

                {/* Tags Row */}
                <div className="flex items-center gap-2 flex-wrap">
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

                {/* Action */}
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="mt-auto w-full text-center py-2 text-sm font-medium rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition"
                >
                  {completed ? 'Retake Quiz' : 'Start Quiz'}
                </Link>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}