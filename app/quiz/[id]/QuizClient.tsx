'use client'

import { useState } from 'react'
import { submitQuiz } from '../actions'

// ✅ No correct_answer field — security enforced at type level
type SafeQuestion = {
  id: string
  quiz_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  position: number
}

type Quiz = {
  id: string
  title: string
  subject: string
  difficulty: string
  xp_reward: number
  description: string | null
}

type PreviousAttempt = {
  id: string
  score: number
  total_questions: number
} | null

export default function QuizClient({
  quiz,
  questions,
  isFirstAttempt,
  previousAttempt,
}: {
  quiz: Quiz
  questions: SafeQuestion[]
  isFirstAttempt: boolean
  previousAttempt: PreviousAttempt
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const question = questions[current]
  const totalQuestions = questions.length
  const progress = ((current + 1) / totalQuestions) * 100
  const isLast = current === totalQuestions - 1
  const currentAnswer = answers[question.id]
  const answeredCount = Object.keys(answers).length

  const options: { key: string; label: string }[] = [
    { key: 'a', label: question.option_a },
    { key: 'b', label: question.option_b },
    { key: 'c', label: question.option_c },
    { key: 'd', label: question.option_d },
  ]

  const difficultyColor: Record<string, string> = {
    easy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    hard: 'text-red-400 bg-red-500/10 border-red-500/20',
  }

  function handleSelect(key: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: key }))
  }

  function handleNext() {
    if (current < totalQuestions - 1) setCurrent((prev) => prev + 1)
  }

  function handlePrev() {
    if (current > 0) setCurrent((prev) => prev - 1)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Quiz Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${difficultyColor[quiz.difficulty]}`}>
            {quiz.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>Question {current + 1} of {totalQuestions}</span>
          <span>·</span>
          <span className="text-yellow-400">+{quiz.xp_reward} XP available</span>
          {!isFirstAttempt && previousAttempt && (
            <>
              <span>·</span>
              <span className="text-gray-500">
                Last: {previousAttempt.score}/{previousAttempt.total_questions}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Retake warning */}
      {!isFirstAttempt && (
        <div className="px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          ⚠️ You have already attempted this quiz. Retakes do not earn XP.
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>{answeredCount} answered</span>
          <span>{totalQuestions - answeredCount} remaining</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        <p className="text-white font-medium text-base leading-relaxed">
          {question.question_text}
        </p>

        <div className="space-y-2.5">
          {options.map((option) => {
            const selected = currentAnswer === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 active:scale-[0.99] ${
                  selected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/10'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white hover:bg-gray-750'
                }`}
              >
                <span className={`uppercase font-bold mr-3 text-xs ${selected ? 'text-emerald-400' : 'text-gray-500'}`}>
                  {option.key}.
                </span>
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handlePrev}
          disabled={current === 0}
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 hover:bg-gray-800 rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Prev
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-200 ${
                i === current
                  ? 'bg-emerald-400 w-4 h-2.5'
                  : answers[q.id]
                  ? 'bg-emerald-700 w-2.5 h-2.5'
                  : 'bg-gray-700 w-2.5 h-2.5 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentAnswer}
            className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-gray-950 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <div className="w-16" />
        )}
      </div>

      {/* Submit — only on last question */}
      {isLast && (
        <form
          action={submitQuiz}
          onSubmit={() => setIsSubmitting(true)}
        >
          <input type="hidden" name="quiz_id" value={quiz.id} />
          <input type="hidden" name="total_questions" value={totalQuestions} />
          <input
            type="hidden"
            name="question_ids"
            value={questions.map((q) => q.id).join(',')}
          />
          {questions.map((q) => (
            <input
              key={q.id}
              type="hidden"
              name={`answer_${q.id}`}
              value={answers[q.id] ?? ''}
            />
          ))}
          <button
            type="submit"
            disabled={answeredCount < totalQuestions || isSubmitting}
            className="w-full py-3 text-sm font-bold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 hover:bg-emerald-400 text-gray-950 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting...
              </>
            ) : answeredCount < totalQuestions ? (
              `Answer all questions (${answeredCount}/${totalQuestions})`
            ) : (
              'Submit Quiz →'
            )}
          </button>
        </form>
      )}

    </div>
  )
}