import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminOverviewPage() {
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

  // Fetch stats in parallel
  const [quizzesRes, questionsRes, usersRes, attemptsRes] = await Promise.all([
    supabase.from('quizzes').select('id', { count: 'exact' }),
    supabase.from('questions').select('id', { count: 'exact' }),
    supabase.from('profiles').select('id', { count: 'exact' }),
    supabase.from('quiz_attempts').select('id', { count: 'exact' }),
  ])

  const stats = [
    {
      label: 'Total Quizzes',
      value: quizzesRes.count ?? 0,
      emoji: '📚',
      href: '/admin/quizzes',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      label: 'Total Questions',
      value: questionsRes.count ?? 0,
      emoji: '❓',
      href: '/admin/quizzes',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      label: 'Registered Users',
      value: usersRes.count ?? 0,
      emoji: '👥',
      href: null,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      label: 'Quiz Attempts',
      value: attemptsRes.count ?? 0,
      emoji: '🎯',
      href: null,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10 border-yellow-500/20',
    },
  ]

  // Recent quizzes
  const { data: recentQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, subject, difficulty, xp_reward, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Overview</h1>
          <p className="text-gray-400 mt-1 text-sm">
            Manage quizzes, questions and monitor platform activity.
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 font-bold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20"
        >
          + New Quiz
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gray-900 border rounded-2xl p-5 ${stat.bg} ${
              stat.href ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
            }`}
          >
            {stat.href ? (
              <Link href={stat.href} className="block">
                <p className="text-2xl mb-2">{stat.emoji}</p>
                <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </Link>
            ) : (
              <>
                <p className="text-2xl mb-2">{stat.emoji}</p>
                <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Recent Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Quizzes</h2>
          <Link
            href="/admin/quizzes"
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {recentQuizzes && recentQuizzes.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Subject
                  </th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    XP
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {recentQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-white font-medium truncate max-w-[200px]">
                        {quiz.title}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs text-gray-400">{quiz.subject}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-xs font-semibold text-yellow-400">
                        +{quiz.xp_reward}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/quizzes/${quiz.id}/questions`}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-400 font-medium">No quizzes yet</p>
              <p className="text-gray-600 text-sm mt-1">
                Create your first quiz to get started
              </p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}