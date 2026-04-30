import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type LeaderboardEntry = {
  id: string
  email: string
  username: string | null
  xp: number
  level: number
  rank: number
}

function getMedalColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-gray-600'
}

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `#${rank}`
}

function getInitials(email: string, username: string | null): string {
  if (username) return username.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

function getDisplayName(email: string, username: string | null): string {
  if (username) return username
  // Show partial email for privacy e.g. fo***@gmail.com
  const [local, domain] = email.split('@')
  const masked = local.slice(0, 2) + '***'
  return `${masked}@${domain}`
}

function getLevelColor(level: number): string {
  if (level >= 10) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  if (level >= 5) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch leaderboard view
  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(50)

  // Find current user's rank
  const myEntry = leaderboard?.find((entry: LeaderboardEntry) => entry.id === user.id)

  const top3 = leaderboard?.slice(0, 3) ?? []
  const rest = leaderboard?.slice(3) ?? []

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Top learners ranked by XP. Keep learning to climb the ranks!
        </p>
      </div>

      {/* Your Rank Banner */}
      {myEntry && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getMedalEmoji(myEntry.rank)}</span>
            <div>
              <p className="text-sm font-semibold text-white">Your Ranking</p>
              <p className="text-xs text-gray-400">
                {getDisplayName(myEntry.email, myEntry.username)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-bold text-lg">{myEntry.xp} XP</p>
            <p className="text-xs text-gray-400">Level {myEntry.level}</p>
          </div>
        </div>
      )}

      {/* Top 3 Podium */}
      {top3.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Top Performers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {top3.map((entry: LeaderboardEntry) => {
              const isMe = entry.id === user.id
              return (
                <div
                  key={entry.id}
                  className={`bg-gray-900 border rounded-2xl p-5 text-center space-y-3 ${
                    isMe
                      ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
                      : 'border-gray-800'
                  }`}
                >
                  {/* Medal */}
                  <div className="text-4xl">{getMedalEmoji(entry.rank)}</div>

                  {/* Avatar */}
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                    <span className="text-sm font-bold text-white">
                      {getInitials(entry.email, entry.username)}
                    </span>
                  </div>

                  {/* Name */}
                  <div>
                    <p className="text-white font-semibold text-sm">
                      {getDisplayName(entry.email, entry.username)}
                      {isMe && (
                        <span className="ml-1.5 text-xs text-emerald-400">(you)</span>
                      )}
                    </p>
                  </div>

                  {/* Level Badge */}
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full border font-medium ${getLevelColor(entry.level)}`}>
                    Level {entry.level}
                  </span>

                  {/* XP */}
                  <p className={`text-xl font-extrabold ${getMedalColor(entry.rank)}`}>
                    {entry.xp} XP
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      {rest.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            Full Rankings
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                    Rank
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rest.map((entry: LeaderboardEntry) => {
                  const isMe = entry.id === user.id
                  return (
                    <tr
                      key={entry.id}
                      className={`transition ${
                        isMe
                          ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500'
                          : 'hover:bg-gray-800/50'
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-5 py-3.5">
                        <span className={`text-sm font-bold ${getMedalColor(entry.rank)}`}>
                          {getMedalEmoji(entry.rank)}
                        </span>
                      </td>

                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-white">
                              {getInitials(entry.email, entry.username)}
                            </span>
                          </div>
                          <span className="text-sm text-white font-medium">
                            {getDisplayName(entry.email, entry.username)}
                            {isMe && (
                              <span className="ml-1.5 text-xs text-emerald-400">(you)</span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Level */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getLevelColor(entry.level)}`}>
                          Level {entry.level}
                        </span>
                      </td>

                      {/* XP */}
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-semibold text-white">
                          {entry.xp} XP
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!leaderboard || leaderboard.length === 0) && (
        <div className="text-center py-16 text-gray-600">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium text-gray-400">No rankings yet</p>
          <p className="text-sm mt-1">Complete a quiz to appear on the leaderboard!</p>
        </div>
      )}

    </div>
  )
}