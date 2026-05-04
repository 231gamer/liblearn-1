import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Quiz } from '@/lib/type'

// Max quizzes shown per subject before "View all" kicks in
const PER_SUBJECT_LIMIT = 3

export default async function QuizListPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string; all?: string }>
}) {
  const params = await searchParams
  const activeSubject = params.subject ?? 'All'
  const showAll = params.all === '1'

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: attempts } = await supabase
    .from('quiz_attempts')
    .select('quiz_id, score, total_questions, xp_earned')
    .eq('user_id', user.id)

  // Best attempt per quiz by xp_earned
  const attemptMap = new Map<string, { score: number; total: number; xp: number }>()
  attempts?.forEach((a) => {
    const existing = attemptMap.get(a.quiz_id)
    if (!existing || a.xp_earned > existing.xp) {
      attemptMap.set(a.quiz_id, {
        score: a.score,
        total: a.total_questions,
        xp: a.xp_earned,
      })
    }
  })

  // Unique subjects
  const allSubjects = [
    'All',
    ...Array.from(new Set(quizzes?.map((q: Quiz) => q.subject) ?? [])).sort(),
  ]

  // Filter by active subject
  const filtered =
    activeSubject === 'All'
      ? (quizzes ?? [])
      : (quizzes ?? []).filter((q: Quiz) => q.subject === activeSubject)

  // Group by subject
  const grouped = filtered.reduce<Record<string, Quiz[]>>((acc, quiz: Quiz) => {
    if (!acc[quiz.subject]) acc[quiz.subject] = []
    acc[quiz.subject].push(quiz)
    return acc
  }, {})

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Quizzes</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Pick a subject, take a quiz, and earn XP to level up.
        </p>
      </div>

      {/* Subject Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {allSubjects.map((subject) => {
          const count =
            subject === 'All'
              ? (quizzes?.length ?? 0)
              : (quizzes ?? []).filter((q: Quiz) => q.subject === subject).length
          const isActive = activeSubject === subject

          return (
            <Link
              key={subject}
              href={
                subject === 'All'
                  ? '/quiz'
                  : `/quiz?subject=${encodeURIComponent(subject)}`
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-600'
              }`}
            >
              {subject}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {count}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Grouped Quiz Sections */}
      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📚</p>
          <p className="font-medium text-gray-400">No quizzes found</p>
          <p className="text-sm mt-1 text-gray-600">
            Check back soon — more quizzes are coming!
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([subject, subjectQuizzes]) => {
            // When viewing "All" subjects, limit per subject unless showAll
            const isFiltered = activeSubject !== 'All'
            const limit = isFiltered || showAll ? subjectQuizzes.length : PER_SUBJECT_LIMIT
            const visibleQuizzes = subjectQuizzes.slice(0, limit)
            const hiddenCount = subjectQuizzes.length - visibleQuizzes.length

            return (
              <div key={subject}>

                {/* Subject Heading */}
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-semibold text-white">{subject}</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-500 border border-gray-700">
                    {subjectQuizzes.length} {subjectQuizzes.length === 1 ? 'quiz' : 'quizzes'}
                  </span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>

                {/* Quiz Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleQuizzes.map((quiz: Quiz) => {
                    const attempt = attemptMap.get(quiz.id)
                    const completed = !!attempt

                    return (
                      <div
                        key={quiz.id}
                        className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 flex flex-col gap-4 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-white text-sm truncate">
                              {quiz.title}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {quiz.description}
                            </p>
                          </div>
                          {completed && (
                            <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Done ✓
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
                            {quiz.difficulty}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                            +{quiz.xp_reward} XP
                          </span>
                        </div>

                        {completed && attempt && (
                          <div className="bg-gray-800/80 rounded-xl px-4 py-2.5 text-sm flex items-center justify-between">
                            <span className="text-gray-400 text-xs">Best score</span>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-semibold text-xs">
                                {attempt.score}/{attempt.total}
                              </span>
                              <span className="text-emerald-400 text-xs font-medium">
                                +{attempt.xp} XP
                              </span>
                            </div>
                          </div>
                        )}

                        <Link
                          href={`/quiz/${quiz.id}`}
                          className="mt-auto w-full text-center py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 transition-all duration-200"
                        >
                          {completed ? 'Retake Quiz' : 'Start Quiz →'}
                        </Link>
                      </div>
                    )
                  })}
                </div>

                {/* Show more for this subject */}
                {hiddenCount > 0 && (
                  <div className="mt-4 text-center">
                    <Link
                      href={`/quiz?subject=${encodeURIComponent(subject)}`}
                      className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200"
                    >
                      View {hiddenCount} more {subject} {hiddenCount === 1 ? 'quiz' : 'quizzes'} →
                    </Link>
                  </div>
                )}

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}