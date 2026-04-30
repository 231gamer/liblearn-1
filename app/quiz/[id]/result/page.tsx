import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'

function getGrade(score: number, total: number) {
  const percent = (score / total) * 100
  if (percent === 100) return { label: 'Perfect!', emoji: '🏆', color: 'text-yellow-400' }
  if (percent >= 75) return { label: 'Great Job!', emoji: '🎉', color: 'text-emerald-400' }
  if (percent >= 50) return { label: 'Good Effort!', emoji: '👍', color: 'text-blue-400' }
  return { label: 'Keep Practicing!', emoji: '💪', color: 'text-orange-400' }
}

function getMotivation(score: number, total: number): string {
  const percent = (score / total) * 100
  if (percent === 100) return 'Incredible! You got every single question right. You are a champion!'
  if (percent >= 75) return 'Excellent work! You have a strong grasp of this topic.'
  if (percent >= 50) return 'Not bad at all! Review the ones you missed and try again.'
  return "Don't give up! Every attempt makes you stronger. Try again!"
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ score?: string; total?: string; xp?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

  const score = parseInt(sp.score ?? '0')
  const total = parseInt(sp.total ?? '0')
  const xpEarned = parseInt(sp.xp ?? '0')

  if (!id || total === 0) notFound()

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch quiz info
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, subject, difficulty, xp_reward')
    .eq('id', id)
    .single()

  if (!quiz) notFound()

  // Fetch updated profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level')
    .eq('id', user.id)
    .single()

  const percent = Math.round((score / total) * 100)
  const grade = getGrade(score, total)
  const motivation = getMotivation(score, total)

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  // XP progress calculation
  const currentXp = profile?.xp ?? 0
  const currentLevel = profile?.level ?? 1
  const previousLevelXp = (currentLevel - 1) * 100
  const nextLevelXp = currentLevel * 100
  const progressPercent = Math.min(
    Math.max(
      ((currentXp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100,
      0
    ),
    100
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Grade Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center space-y-3">
        <div className="text-6xl">{grade.emoji}</div>
        <h1 className={`text-3xl font-extrabold ${grade.color}`}>
          {grade.label}
        </h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">{motivation}</p>
      </div>

      {/* Score Breakdown */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-white font-semibold text-lg">Your Results</h2>

        {/* Quiz Info */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
            {quiz.subject}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
            {quiz.difficulty}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-extrabold text-white">
              {score}/{total}
            </p>
            <p className="text-xs text-gray-500 mt-1">Score</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-extrabold text-white">{percent}%</p>
            <p className="text-xs text-gray-500 mt-1">Accuracy</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-2xl font-extrabold text-emerald-400">
              +{xpEarned}
            </p>
            <p className="text-xs text-gray-500 mt-1">XP Earned</p>
          </div>
        </div>

        {/* Score Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Score</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                percent === 100
                  ? 'bg-yellow-400'
                  : percent >= 75
                  ? 'bg-emerald-500'
                  : percent >= 50
                  ? 'bg-blue-500'
                  : 'bg-orange-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* XP + Level Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold">Your Progress</h2>
          <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Level {currentLevel}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total XP</span>
          <span className="text-white font-semibold">{currentXp} XP</span>
        </div>

        {/* Level Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Level {currentLevel}</span>
            <span>Level {currentLevel + 1}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <div
              className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {nextLevelXp - currentXp} XP to next level
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/dashboard"
          className="py-3 text-sm font-semibold text-center rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 transition"
        >
          ← Dashboard
        </Link>
        <Link
          href={`/quiz/${quiz.id}`}
          className="py-3 text-sm font-semibold text-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 transition"
        >
          Retake Quiz →
        </Link>
      </div>

    </div>
  )
}