import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { setupUsername } from './actions'

export default async function UsernameSetupPage({
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

  // Already has username — skip setup
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  if (profile?.username) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Lib<span className="text-emerald-400">Learn</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            One last step before you start learning
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-xl space-y-6">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Choose your username
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              This is how you will appear on the leaderboard and to other learners.
            </p>
          </div>

          {/* Error Banner */}
          {params.error && (
            <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {params.error}
            </div>
          )}

          {/* Form */}
          <form action={setupUsername} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                  @
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  autoFocus
                  placeholder="your_username"
                  maxLength={20}
                  className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition text-sm"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                3–20 characters. Lowercase letters, numbers and underscores only.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-semibold rounded-lg transition text-sm"
            >
              Set Username & Continue →
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}