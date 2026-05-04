import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function xpForNextLevel(level: number): number {
  return level * 100
}

function getLevelProgress(xp: number, level: number): number {
  const previousLevelXp = (level - 1) * 100
  const nextLevelXp = xpForNextLevel(level)
  const progress = ((xp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

const difficultyColor: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: true })

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
  const displayName = profile?.username ?? user.email ?? 'Learner'

  return (
    <div className="space-y-8">

      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Welcome back, <span className="text-emerald-400">{displayName}</span> 👋
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Keep learning and climb the leaderboard.
        </p>
      </div>

      {/* Stats Row — compact on mobile */}
      <div className="grid grid-cols-3 gap-3">

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 hidden sm:block">
            Level
          </p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 sm:hidden">
            LVL
          </p>
          <p className="text-3xl font-extrabold text-emerald-400">{level}</p>
          <p className="text-xs text-gray-600 mt-1 hidden sm:block">Current level</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
            XP
          </p>
          <p className="text-3xl font-extrabold text-white">{xp}</p>
          <p className="text-xs text-gray-600 mt-1 hidden sm:block">{xpNeeded - xp} to next</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 text-center">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 hidden sm:block">
            Quizzes
          </p>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 sm:hidden">
            Done
          </p>
          <p className="text-3xl font-extrabold text-white">{attemptedQuizIds.size}</p>
          <p className="text-xs text-gray-600 mt-1 hidden sm:block">
            of {quizzes?.length ?? 0} done
          </p>
        </div>

      </div>

      {/* XP Progress Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-white">Level {level} Progress</span>
          <span className="text-sm text-gray-400">{xp} / {xpNeeded} XP</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-3 rounded-full transition-all duration-700 ease-out"
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
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
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
                className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-gray-700 transition-all duration-200"
              >
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

                <Link
                  href={`/quiz/${quiz.id}`}
                  className="mt-auto w-full text-center py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 transition-all duration-200"
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