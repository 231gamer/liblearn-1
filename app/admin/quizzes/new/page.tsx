import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createQuiz } from '../../actions'

const SUBJECTS = [
  'History',
  'Mathematics',
  'Science',
  'English',
  'Geography',
  'Civic Education',
  'General Knowledge',
]

export default async function NewQuizPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/quizzes"
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          ← Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create New Quiz</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Fill in the details below. You will add questions on the next step.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {params.error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          ⚠️ {params.error}
        </div>
      )}

      {/* Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <form action={createQuiz} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Quiz Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              placeholder="e.g. Liberia Independence History"
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Description
              <span className="text-gray-600 font-normal ml-1">(optional)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of what this quiz covers..."
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm resize-none"
            />
          </div>

          {/* Subject + Difficulty row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Subject <span className="text-red-400">*</span>
              </label>
              <select
                name="subject"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
              >
                <option value="">Select subject...</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Difficulty <span className="text-red-400">*</span>
              </label>
              <select
                name="difficulty"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
              >
                <option value="">Select difficulty...</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              XP Reward <span className="text-red-400">*</span>
            </label>
            <input
              name="xp_reward"
              type="number"
              required
              min={1}
              max={500}
              defaultValue={20}
              className="w-full px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
            />
            <p className="text-xs text-gray-600 mt-1.5">
              Between 1–500. Easy = 10–20, Medium = 20–40, Hard = 40–100.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 font-bold text-sm bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-gray-950 rounded-xl transition-all duration-200"
          >
            Create Quiz & Add Questions →
          </button>
        </form>
      </div>

    </div>
  )
}