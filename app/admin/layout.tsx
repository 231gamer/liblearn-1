import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { logout } from '@/app/auth/actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  const navLinks = [
    { href: '/admin', label: '📊 Overview', exact: true },
    { href: '/admin/quizzes', label: '📚 Quizzes', exact: false },
  ]

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Admin Topbar */}
      <nav className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          <div className="flex items-center gap-4">
            {/* Logo */}
            <Link href="/admin" className="text-lg font-extrabold text-white tracking-tight">
              Lib<span className="text-emerald-400">Learn</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                Admin
              </span>
            </Link>

            {/* Nav links */}
            <div className="hidden sm:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← Back to App
            </Link>
            <span className="text-xs text-gray-600 hidden sm:block">
              {profile.username}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>

    </div>
  )
}