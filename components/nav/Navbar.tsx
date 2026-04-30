'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/auth/actions'

export default function Navbar({ email }: { email: string }) {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/quiz', label: 'Quizzes' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-extrabold text-white tracking-tight">
          Lib<span className="text-emerald-400">Learn</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                pathname.startsWith(link.href)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400 hidden md:block">{email}</span>
          <form action={logout}>
            <button
              type="submit"
              className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition"
            >
              Sign Out
            </button>
          </form>
        </div>

      </div>
    </nav>
  )
}