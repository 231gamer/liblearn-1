import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { addQuestion, deleteQuestion } from '../../../actions'

export default async function ManageQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { id } = await params
  const sp = await searchParams

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

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('id', id)
    .single()

  if (!quiz) notFound()

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', id)
    .order('position', { ascending: true })

  const nextPosition = (questions?.length ?? 0) + 1

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  const correctLabel: Record<string, string> = {
    a: 'A', b: 'B', c: 'C', d: 'D',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/admin/quizzes"
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              ← Quizzes
            </Link>
          </div>
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs text-gray-500">{quiz.subject}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
              {quiz.difficulty}
            </span>
            <span className="text-xs text-yellow-400">+{quiz.xp_reward} XP</span>
            <span className="text-xs text-gray-600">
              · {questions?.length ?? 0} questions
            </span>
          </div>
        </div>
        <Link
          href={`/quiz/${quiz.id}`}
          target="_blank"
          className="shrink-0 text-xs px-3 py-1.5 text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition-all"
        >
          Preview ↗
        </Link>
      </div>

      {/* Success / Error Banners */}
      {sp.message && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          ✓ {sp.message}
        </div>
      )}
      {sp.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {sp.error}
        </div>
      )}

      {/* Existing Questions */}
      {questions && questions.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {questions.length} Question{questions.length !== 1 ? 's' : ''}
          </h2>
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {q.question_text}
                  </p>
                </div>
                <form action={deleteQuestion}>
                  <input type="hidden" name="question_id" value={q.id} />
                  <input type="hidden" name="quiz_id" value={quiz.id} />
                  <button
                    type="submit"
                    className="shrink-0 text-xs text-gray-600 hover:text-red-400 transition-colors px-2 py-1"
                    onClick={(e) => {
                      if (!confirm('Delete this question?')) e.preventDefault()
                    }}
                  >
                    ✕
                  </button>
                </form>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-2 pl-9">
                {['a', 'b', 'c', 'd'].map((key) => {
                  const isCorrect = q.correct_answer === key
                  return (
                    <div
                      key={key}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
                        isCorrect
                          ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                          : 'bg-gray-800 border border-gray-700 text-gray-400'
                      }`}
                    >
                      <span className={`font-bold uppercase ${isCorrect ? 'text-emerald-400' : 'text-gray-600'}`}>
                        {correctLabel[key]}.
                      </span>
                      {q[`option_${key}` as keyof typeof q] as string}
                      {isCorrect && (
                        <span className="ml-auto text-emerald-400">✓</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Question Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <h2 className="text-base font-semibold text-white">
          Add Question #{nextPosition}
        </h2>

        <form action={addQuestion} className="space-y-4">
          <input type="hidden" name="quiz_id" value={quiz.id} />
          <input type="hidden" name="position" value={nextPosition} />

          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Question <span className="text-red-400">*</span>
            </label>
            <textarea
              name="question_text"
              rows={3}
              required
              placeholder="What is the capital city of Liberia?"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm resize-none"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            {['a', 'b', 'c', 'd'].map((key) => (
              <div key={key}>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Option {key.toUpperCase()} <span className="text-red-400">*</span>
                </label>
                <input
                  name={`option_${key}`}
                  type="text"
                  required
                  placeholder={`Option ${key.toUpperCase()}`}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                />
              </div>
            ))}
          </div>

          {/* Correct answer */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Correct Answer <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['a', 'b', 'c', 'd'].map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-gray-700 bg-gray-800 cursor-pointer has-[:checked]:bg-emerald-500/10 has-[:checked]:border-emerald-500/50 transition-all"
                >
                  <input
                    type="radio"
                    name="correct_answer"
                    value={key}
                    required
                    className="sr-only"
                  />
                  <span className="text-sm font-bold text-gray-300 uppercase">{key}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1.5">
              Select which option is the correct answer.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 font-bold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-gray-950 rounded-xl transition-all duration-200"
          >
            Add Question →
          </button>
        </form>
      </div>

      {/* Done button */}
      <div className="flex justify-end">
        <Link
          href="/admin/quizzes"
          className="px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-all duration-200"
        >
          Done — Back to Quizzes
        </Link>
      </div>

    </div>
  )
}