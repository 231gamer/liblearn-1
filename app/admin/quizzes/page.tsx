import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteQuiz } from '../actions'

export default async function AdminQuizzesPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const params = await searchParams
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

  // Quizzes with question counts
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select(`
      id,
      title,
      subject,
      difficulty,
      xp_reward,
      created_at,
      questions(id)
    `)
    .order('created_at', { ascending: false })

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Quizzes</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {quizzes?.length ?? 0} quizzes in the library
          </p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 font-bold text-sm rounded-xl transition-all duration-200"
        >
          + New Quiz
        </Link>
      </div>

      {/* Success Banner */}
      {params.message && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          ✓ {params.message}
        </div>
      )}

      {/* Quiz Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {quizzes && quizzes.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quiz
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Subject
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difficulty
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Questions
                </th>
                <th className="text-center px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  XP
                </th>
                <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {quizzes.map((quiz) => {
                const questionCount = Array.isArray(quiz.questions)
                  ? quiz.questions.length
                  : 0

                return (
                  <tr
                    key={quiz.id}
                    className="hover:bg-gray-800/40 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm text-white font-medium">
                        {quiz.title}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-xs text-gray-400">{quiz.subject}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className={`text-xs font-semibold ${
                        questionCount === 0 ? 'text-red-400' : 'text-gray-300'
                      }`}>
                        {questionCount === 0 ? '⚠️ 0' : questionCount}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden sm:table-cell">
                      <span className="text-xs font-semibold text-yellow-400">
                        +{quiz.xp_reward}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/quizzes/${quiz.id}/questions`}
                          className="text-xs px-3 py-1.5 font-medium text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/10 rounded-lg transition-all duration-200"
                        >
                          Questions
                        </Link>
                        <form action={deleteQuiz}>
                          <input type="hidden" name="quiz_id" value={quiz.id} />
                          <button
                            type="submit"
                            className="text-xs px-3 py-1.5 font-medium text-gray-500 hover:text-red-400 border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                            onClick={(e) => {
                              if (!confirm(`Delete "${quiz.title}"? This cannot be undone.`)) {
                                e.preventDefault()
                              }
                            }}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-400 font-medium">No quizzes yet</p>
            <p className="text-gray-600 text-sm mt-1 mb-4">
              Create your first quiz to get started
            </p>
            <Link
              href="/admin/quizzes/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-xl transition-all"
            >
              + Create First Quiz
            </Link>
          </div>
        )}
      </div>

    </div>
  )
}