import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LeaderboardEntry } from '@/lib/type'

function getMedalEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return `${rank}`
}

function getInitials(email: string, username: string | null): string {
  if (username) return username.slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

function getDisplayName(email: string, username: string | null): string {
  if (username) return username
  const [local, domain] = email.split('@')
  return `${local.slice(0, 2)}***@${domain}`
}

function getLevelColor(level: number): string {
  if (level >= 10) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'
  if (level >= 5) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
}

function getRankColor(rank: number): string {
  if (rank === 1) return 'text-yellow-400'
  if (rank === 2) return 'text-gray-300'
  if (rank === 3) return 'text-amber-600'
  return 'text-gray-600'
}

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: leaderboard } = await supabase
    .from('leaderboard')
    .select('*')
    .order('rank', { ascending: true })
    .limit(50)

  const myEntry = leaderboard?.find(
    (entry: LeaderboardEntry) => entry.id === user.id
  )

  return (
    <div className="space-y-6">

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

      {/* Single Unified Leaderboard Table */}
      {leaderboard && leaderboard.length > 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-800">
            <div className="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider">
              #
            </div>
            <div className="col-span-7 text-xs font-medium text-gray-500 uppercase tracking-wider">
              Player
            </div>
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
              Lvl
            </div>
            <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
              XP
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-800">
            {leaderboard.map((entry: LeaderboardEntry) => {
              const isMe = entry.id === user.id
              const isTop3 = entry.rank <= 3

              return (
                <div
                  key={entry.id}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3.5 transition-colors duration-150 ${
                    isMe
                      ? 'bg-emerald-500/5 border-l-2 border-l-emerald-500'
                      : 'hover:bg-gray-800/40'
                  }`}
                >
                  {/* Rank */}
                  <div className="col-span-1">
                    <span className={`text-sm font-bold ${getRankColor(entry.rank)}`}>
                      {isTop3 ? getMedalEmoji(entry.rank) : entry.rank}
                    </span>
                  </div>

                  {/* Player */}
                  <div className="col-span-7 flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      isTop3 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-gray-800 border border-gray-700'
                    }`}>
                      {getInitials(entry.email, entry.username)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {getDisplayName(entry.email, entry.username)}
                      </p>
                      {isMe && (
                        <p className="text-xs text-emerald-400">you</p>
                      )}
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${getLevelColor(entry.level)}`}>
                      {entry.level}
                    </span>
                  </div>

                  {/* XP */}
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-semibold ${isTop3 ? 'text-emerald-400' : 'text-white'}`}>
                      {entry.xp}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-medium text-gray-400">No rankings yet</p>
          <p className="text-sm mt-1 text-gray-600">
            Complete a quiz to appear on the leaderboard!
          </p>
        </div>
      )}

    </div>
  )
}