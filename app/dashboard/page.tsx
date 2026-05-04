import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getLevelProgress, xpForNextLevel } from '@/lib/quiz-engine/scorer'
import type { Quiz, LeaderboardEntry } from '@/lib/types'

const difficultyColor: Record<string, string> = {
  easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  hard: 'text-red-400 bg-red-500/10 border-red-500/20',
}

const DASHBOARD_QUIZ_LIMIT = 4
const LEADERBOARD_PREVIEW_LIMIT = 5

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

function getDisplayName(email: string, username: string | null): string {
  if (username) return username
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}***@${domain}`
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-gray-500'
}

function getQuizCTA(completed: boolean, score?: number, total?: number): {
  label: string
  sub: string
} {
  if (!completed) return { label: 'Start Quiz →', sub: 'Earn XP' }
  if (!score || !total) return { label: 'Retry to Level Up →', sub: 'Improve score' }
  const pct = Math.round((score / total) * 100)
  if (pct === 100) return { label: 'Perfect! Replay →', sub: 'Challenge yourself' }
  if (pct >= 75) return { label: 'Improve Score →', sub: `${pct}% last time` }
  if (pct >= 50) return { label: 'Retry to Level Up →', sub: `Only ${pct}% — you can do better` }
  return { label: 'Try Again →', sub: `${pct}% — big XP waiting` }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const [profileRes, quizzesRes, attemptsRes, leaderboardRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('quizzes').select('*').order('created_at', { ascending: false }),
    supabase
      .from('quiz_attempts')
      .select('quiz_id, score, total_questions, xp_earned, completed_at')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false }),
    supabase
      .from('leaderboard')
      .select('*')
      .order('rank', { ascending: true })
      .limit(LEADERBOARD_PREVIEW_LIMIT),
  ])

  const profile = profileRes.data
  const allQuizzes = quizzesRes.data ?? []
  const attempts = attemptsRes.data ?? []
  const leaderboard = leaderboardRes.data ?? []

  // Best attempt per quiz
  const attemptMap = new Map<string, { xp: number; score: number; total: number; completed_at: string }>()
  attempts.forEach((a) => {
    const existing = attemptMap.get(a.quiz_id)
    if (!existing || a.xp_earned > existing.xp) {
      attemptMap.set(a.quiz_id, {
        xp: a.xp_earned,
        score: a.score,
        total: a.total_questions,
        completed_at: a.completed_at,
      })
    }
  })

  const attemptedQuizIds = new Set(attempts.map((a) => a.quiz_id))

  const recentIds = [...new Set(attempts.map((a) => a.quiz_id))]
  const recentQuizzes = recentIds
    .map((id) => allQuizzes.find((q: Quiz) => q.id === id))
    .filter(Boolean) as Quiz[]
  const unattempted = allQuizzes.filter((q: Quiz) => !attemptedQuizIds.has(q.id))
  const displayQuizzes = [...recentQuizzes, ...unattempted].slice(0, DASHBOARD_QUIZ_LIMIT)

  const totalQuizzes = allQuizzes.length
  const hasMore = totalQuizzes > DASHBOARD_QUIZ_LIMIT

  const xp = profile?.xp ?? 0
  const level = profile?.level ?? 1
  const progress = getLevelProgress(xp, level)
  const xpNeeded = xpForNextLevel(level)
  const previousXp = (level - 1) * 100
  const xpToNext = xpNeeded - xp
  const displayName = profile?.username ?? user.email ?? 'Learner'
  const myRank = leaderboard.find((e: LeaderboardEntry) => e.id === user.id)

  // Find the person just above current user in leaderboard (rank gap)
  const myLeaderboardIndex = leaderboard.findIndex((e: LeaderboardEntry) => e.id === user.id)
  const personAbove = myLeaderboardIndex > 0 ? leaderboard[myLeaderboardIndex - 1] : null

  return (
    <div className="space-y-8">

      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Hey, <span className="text-emerald-400">{displayName}</span> 👋
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            {xpToNext} XP away from Level {level + 1}. Keep pushing.
          </p>
        </div>
        <Link
          href="/quiz"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          Continue Learning →
        </Link>
      </div>

      {/* ════════════════════════════════
          DESKTOP LAYOUT
      ════════════════════════════════ */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5">

        {/* Left 2/3 */}
        <div className="col-span-2 space-y-4">

          {/* XP Hero Block */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">

            {/* Top row: level pill + quizzes done */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full">
                  <span className="text-emerald-400 font-bold text-sm">Level {level}</span>
                </div>
                {myRank && (
                  <div className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full">
                    <span className="text-gray-300 text-sm font-medium">
                      {getMedalEmoji(myRank.rank)} Rank #{myRank.rank}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {attemptedQuizIds.size}/{totalQuizzes} quizzes done
              </span>
            </div>

            {/* XP big number */}
            <div className="flex items-end gap-2 mb-3">
              <span className="text-5xl font-extrabold text-white tracking-tight">{xp}</span>
              <span className="text-lg text-gray-500 mb-1.5">XP</span>
              <span className="text-sm text-gray-600 mb-2 ml-1">
                / {xpNeeded} for Level {level + 1}
              </span>
            </div>

            {/* Progress bar — thick and bold */}
            <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden mb-2">
              <div
                className="h-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </div>

            {/* Progress labels */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-600">Lvl {level} ({previousXp} XP)</span>
              <span className="text-xs font-semibold text-emerald-400">
                🎯 {xpToNext} XP to Level {level + 1}
              </span>
              <span className="text-xs text-gray-600">Lvl {level + 1} ({xpNeeded} XP)</span>
            </div>
          </div>

          {/* Gap to person above */}
          {personAbove && myRank && (
            <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
              <span className="text-yellow-400 text-lg">⚔️</span>
              <p className="text-sm text-gray-300 flex-1">
                <span className="text-yellow-400 font-semibold">
                  {getDisplayName(personAbove.email, personAbove.username)}
                </span>
                {' '}is just{' '}
                <span className="text-white font-bold">
                  {personAbove.xp - xp} XP
                </span>
                {' '}ahead of you. One quiz could change that.
              </p>
              <Link
                href="/quiz"
                className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-lg transition-all duration-200"
              >
                Beat them →
              </Link>
            </div>
          )}

        </div>

        {/* Right 1/3 — leaderboard */}
        <div className="col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
              </div>
              <Link
                href="/leaderboard"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Full board →
              </Link>
            </div>

            <div className="divide-y divide-gray-800 flex-1">
              {leaderboard.map((entry: LeaderboardEntry, index: number) => {
                const isMe = entry.id === user.id
                const isTop3 = entry.rank <= 3
                const name = getDisplayName(entry.email, entry.username)

                // Show XP gap to next person
                const nextEntry = leaderboard[index + 1]
                const gapToNext = nextEntry ? entry.xp - nextEntry.xp : null

                return (
                  <div key={entry.id}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                        isMe
                          ? 'bg-emerald-500/8 border-l-2 border-l-emerald-500'
                          : 'hover:bg-gray-800/40'
                      }`}
                    >
                      <span className={`text-sm font-bold w-5 text-center shrink-0 ${getRankColor(entry.rank)}`}>
                        {isTop3 ? getMedalEmoji(entry.rank) : entry.rank}
                      </span>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isMe
                          ? 'bg-emerald-500 text-gray-950'
                          : isTop3
                          ? 'bg-emerald-500/20 border border-emerald-500/30 text-white'
                          : 'bg-gray-800 border border-gray-700 text-white'
                      }`}>
                        {name.slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${
                          isMe ? 'text-emerald-400' : 'text-gray-300'
                        }`}>
                          {name}
                          {isMe && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                              you
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-600">Lvl {entry.level}</p>
                      </div>

                      <span className={`text-xs font-bold shrink-0 ${
                        isMe ? 'text-emerald-400' : isTop3 ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {entry.xp}
                      </span>
                    </div>

                    {/* Rank gap indicator */}
                    {gapToNext !== null && gapToNext > 0 && (
                      <div className="flex items-center gap-2 px-4 py-1">
                        <div className="flex-1 h-px bg-gray-800/60" />
                        <span className="text-xs text-gray-700">
                          ↕ {gapToNext} XP gap
                        </span>
                        <div className="flex-1 h-px bg-gray-800/60" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="px-4 py-2.5 border-t border-gray-800">
              <Link
                href="/leaderboard"
                className="w-full block text-center text-xs text-gray-500 hover:text-emerald-400 transition-colors py-1"
              >
                View full leaderboard →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════
          MOBILE LAYOUT
      ════════════════════════════════ */}
      <div className="md:hidden space-y-4">

        {/* XP Hero — merged LVL + XP block */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-full text-emerald-400 font-bold text-xs">
                Level {level}
              </span>
              {myRank && (
                <span className="px-2.5 py-1 bg-gray-800 border border-gray-700 rounded-full text-gray-300 text-xs font-medium">
                  {getMedalEmoji(myRank.rank)} #{myRank.rank}
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600">
              {attemptedQuizIds.size}/{totalQuizzes} done
            </span>
          </div>

          {/* XP number */}
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-4xl font-extrabold text-white">{xp}</span>
            <span className="text-base text-gray-500 mb-1">XP</span>
          </div>

          {/* Bold progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-3.5 overflow-hidden mb-2">
            <div
              className="h-3.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Bold XP label */}
          <p className="text-xs font-bold text-emerald-400 text-center">
            🎯 {xpToNext} XP to Level {level + 1}
          </p>
        </div>

        {/* Gap to person above — mobile */}
        {personAbove && myRank && (
          <div className="flex items-center gap-3 px-4 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
            <span className="text-yellow-400 text-base shrink-0">⚔️</span>
            <p className="text-xs text-gray-300 flex-1">
              <span className="text-yellow-400 font-semibold">
                {getDisplayName(personAbove.email, personAbove.username)}
              </span>
              {' '}is{' '}
              <span className="text-white font-bold">{personAbove.xp - xp} XP</span>
              {' '}ahead.
            </p>
            <Link
              href="/quiz"
              className="shrink-0 text-xs font-semibold px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-lg"
            >
              Beat them →
            </Link>
          </div>
        )}

        {/* Leaderboard — horizontal scroll, 2.5 cards visible */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <span className="text-base">🏆</span>
              <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
            </div>
            <Link
              href="/leaderboard"
              className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              See all →
            </Link>
          </div>

          {/* Cards — fixed width so 2.5 show */}
          <div className="flex gap-2.5 overflow-x-auto px-4 py-3 scrollbar-hide">
            {leaderboard.map((entry: LeaderboardEntry) => {
              const isMe = entry.id === user.id
              const isTop3 = entry.rank <= 3
              const name = getDisplayName(entry.email, entry.username)

              return (
                <div
                  key={entry.id}
                  className={`shrink-0 flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl border transition-all w-[100px] ${
                    isMe
                      ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'bg-gray-800/60 border-gray-700'
                  }`}
                >
                  <span className="text-base">
                    {isTop3 ? getMedalEmoji(entry.rank) : `#${entry.rank}`}
                  </span>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
                    isMe
                      ? 'bg-emerald-500 text-gray-950'
                      : isTop3
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-white'
                      : 'bg-gray-700 border border-gray-600 text-white'
                  }`}>
                    {name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className={`text-xs font-semibold text-center truncate w-full ${
                    isMe ? 'text-emerald-400' : 'text-gray-300'
                  }`}>
                    {name}
                    {isMe && (
                      <span className="block text-xs text-emerald-500/70">(you)</span>
                    )}
                  </p>
                  <p className={`text-xs font-bold ${
                    isMe ? 'text-emerald-400' : isTop3 ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    {entry.xp} XP
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Continue Learning CTA — mobile */}
        <Link
          href="/quiz"
          className="flex items-center justify-between w-full px-5 py-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-gray-950 font-bold text-sm rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          <span>Continue Learning</span>
          <span className="flex items-center gap-1.5">
            <span className="text-xs font-normal opacity-80">Earn XP now</span>
            <span>→</span>
          </span>
        </Link>

      </div>

      {/* ════════════════════════════════
          QUIZ CARDS — shared layout
      ════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {recentQuizzes.length > 0 ? 'Continue Where You Left Off' : 'Start Learning'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {recentQuizzes.length > 0
                ? 'Beat your score and earn more XP'
                : 'Take your first quiz and earn XP'}
            </p>
          </div>
          <Link
            href="/quiz"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors duration-200 shrink-0"
          >
            All quizzes →
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-2 snap-x snap-mandatory sm:snap-none scrollbar-hide">
          {displayQuizzes.map((quiz) => {
            const attempt = attemptMap.get(quiz.id)
            const completed = !!attempt
            const cta = getQuizCTA(completed, attempt?.score, attempt?.total)
            const pct = attempt
              ? Math.round((attempt.score / attempt.total) * 100)
              : null

            return (
              <div
                key={quiz.id}
                className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 shrink-0 w-72 sm:w-auto snap-start group"
              >
                {/* Title row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white text-sm truncate">{quiz.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{quiz.description}</p>
                  </div>
                  {/* XP reward badge — always visible */}
                  <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    +{quiz.xp_reward} XP
                  </span>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-800 text-gray-400 border-gray-700">
                    {quiz.subject}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
                    {quiz.difficulty}
                  </span>
                </div>

                {/* Score progress bar (only if attempted) */}
                {completed && pct !== null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">Your best score</span>
                      <span className={`font-semibold ${
                        pct === 100
                          ? 'text-emerald-400'
                          : pct >= 75
                          ? 'text-blue-400'
                          : pct >= 50
                          ? 'text-yellow-400'
                          : 'text-red-400'
                      }`}>
                        {attempt?.score}/{attempt?.total} — {pct}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          pct === 100
                            ? 'bg-emerald-500'
                            : pct >= 75
                            ? 'bg-blue-500'
                            : pct >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA Button */}
                <Link
                  href={`/quiz/${quiz.id}`}
                  className="mt-auto w-full text-center py-2.5 text-sm font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-emerald-500/10"
                >
                  {cta.label}
                </Link>

                {/* Sub label under button */}
                <p className="text-xs text-gray-600 text-center -mt-1.5">
                  {cta.sub}
                </p>
              </div>
            )
          })}

          {/* Peek card — mobile only */}
          {hasMore && (
            <Link
              href="/quiz"
              className="shrink-0 w-48 sm:hidden snap-start bg-gray-900 border border-dashed border-gray-700 rounded-2xl p-5 flex flex-col items-center justify-center gap-3 text-center hover:border-emerald-500/40 transition-all duration-200"
            >
              <span className="text-3xl">📚</span>
              <p className="text-sm font-medium text-gray-400">
                +{totalQuizzes - DASHBOARD_QUIZ_LIMIT} more
              </p>
              <span className="text-xs text-emerald-400">View all →</span>
            </Link>
          )}
        </div>

        {hasMore && (
          <p className="hidden sm:block text-xs text-gray-600 mt-3 text-center">
            Showing {DASHBOARD_QUIZ_LIMIT} of {totalQuizzes} quizzes —{' '}
            <Link href="/quiz" className="text-emerald-500 hover:text-emerald-400 transition-colors">
              view all quizzes
            </Link>
          </p>
        )}
      </div>

    </div>
  )
}