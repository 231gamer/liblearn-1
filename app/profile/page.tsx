import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { updateUsername } from './setup/actions'

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Your Profile</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage your display name and account details.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Level</p>
          <p className="text-3xl font-extrabold text-emerald-400">{profile?.level ?? 1}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total XP</p>
          <p className="text-3xl font-extrabold text-white">{profile?.xp ?? 0}</p>
        </div>
      </div>

      {/* Update Username */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-white">Username</h2>
          <p className="text-gray-400 text-sm mt-1">
            Your username appears on the leaderboard and your public profile.
          </p>
        </div>

        {/* Error / Success Banners */}
        {params.error && (
          <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {params.error}
          </div>
        )}
        {params.message && (
          <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
            {params.message}
          </div>
        )}

        <form action={updateUsername} className="space-y-4">
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
                defaultValue={profile?.username ?? ''}
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
            Update Username
          </button>
        </form>

        {/* Account Info */}
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Signed in as{' '}
            <span className="text-gray-400">{user.email}</span>
          </p>
        </div>
      </div>

    </div>
  )
}