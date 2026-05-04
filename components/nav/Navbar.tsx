'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/app/auth/actions'

export default function Navbar({
  email,
  username,
}: {
  email: string
  username: string | null
}) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/quiz', label: 'Quizzes' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  const displayName = username ?? email

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-extrabold text-white tracking-tight shrink-0"
        >
          Lib<span className="text-emerald-400">Learn</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname.startsWith(link.href)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/profile"
            className="text-sm text-gray-400 hover:text-emerald-400 transition-colors duration-200"
          >
            {displayName}
          </Link>
<form action={logout}>
  <button
    type="submit"
    className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10 rounded-lg transition-all duration-200 active:scale-95"
  >
    Logout
  </button>
</form>
        </div>

        {/* Mobile: Hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            // X icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger icon
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900 px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Nav Links */}
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname.startsWith(link.href)
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Divider */}
          <div className="border-t border-gray-800 my-2" />

          {/* Profile */}
          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all duration-200"
          >
            {displayName}
          </Link>

          {/* Logout */}
<form action={logout}>
  <button
    type="submit"
    className="w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 active:scale-95"
  >
    Logout
  </button>
</form>

        </div>
      )}
    </nav>
  )
}