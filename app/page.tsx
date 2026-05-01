import Link from 'next/link'

const features = [
  {
    emoji: '🧠',
    title: 'Topic-Based Quizzes',
    description:
      'Take quizzes across subjects like History, Mathematics, Science and more — crafted for Liberian learners.',
  },
  {
    emoji: '⚡',
    title: 'Earn XP & Level Up',
    description:
      'Every quiz you complete earns you XP. Rack up points, level up, and track your growth over time.',
  },
  {
    emoji: '🏆',
    title: 'Compete on the Leaderboard',
    description:
      'See how you rank against other learners. Climb to the top and claim the number one spot.',
  },
  {
    emoji: '📈',
    title: 'Track Your Progress',
    description:
      'Your personal dashboard shows your level, XP, completed quizzes and how close you are to the next level.',
  },
  {
    emoji: '🎯',
    title: 'Multiple Difficulty Levels',
    description:
      'Whether you are just starting out or ready for a challenge — easy, medium and hard quizzes await.',
  },
  {
    emoji: '📱',
    title: 'Works on Any Device',
    description:
      'LibLearn is fully responsive. Learn from your phone, tablet or desktop — anytime, anywhere.',
  },
]

const stats = [
  { value: '100+', label: 'Quiz Questions' },
  { value: 'XP', label: 'Reward System' },
  { value: '∞', label: 'Retakes Allowed' },
  { value: '🇱🇷', label: 'Built for Liberia' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-extrabold tracking-tight">
            Lib<span className="text-emerald-400">Learn</span>
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-24 pb-20 text-center space-y-8">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium">
          🇱🇷 Built for Liberian Learners
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
          Learn. Earn XP.{' '}
          <span className="text-emerald-400">Level Up.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          LibLearn makes studying fun and rewarding. Take quizzes, earn experience
          points, climb the leaderboard, and become the top learner in Liberia.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="px-8 py-3.5 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl transition w-full sm:w-auto text-center"
          >
            Start Learning for Free →
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-3.5 text-base font-semibold border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white rounded-xl transition w-full sm:w-auto text-center"
          >
            Sign In
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-2xl mx-auto">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center"
            >
              <p className="text-2xl font-extrabold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-extrabold text-white">
            Everything you need to learn better
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto text-sm">
            LibLearn combines the fun of gaming with the power of education —
            keeping you motivated every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-6 space-y-3 transition"
            >
              <div className="text-3xl">{feature.emoji}</div>
              <h3 className="text-white font-semibold">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-8 py-12 text-center space-y-5">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to start your learning journey?
          </h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Join LibLearn today, take your first quiz, and start earning XP.
            Your first level up is just a few questions away.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-3.5 text-base font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl transition"
          >
            Create Free Account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-extrabold tracking-tight">
            Lib<span className="text-emerald-400">Learn</span>
          </span>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} LibLearn. Built with ❤️ for Liberia.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/auth/login" className="hover:text-gray-400 transition">
              Sign In
            </Link>
            <Link href="/auth/signup" className="hover:text-gray-400 transition">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}