'use client'

import { useState } from 'react'
import { submitQuiz } from '../actions'

type Question = {
  id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: string
  position: number
}

type Quiz = {
  id: string
  title: string
  subject: string
  difficulty: string
  xp_reward: number
}

export default function QuizClient({
  quiz,
  questions,
}: {
  quiz: Quiz
  questions: Question[]
}) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const question = questions[current]
  const totalQuestions = questions.length
  const progress = ((current + 1) / totalQuestions) * 100
  const isLast = current === totalQuestions - 1
  const currentAnswer = answers[question.id]

  const options: { key: string; label: string }[] = [
    { key: 'a', label: question.option_a },
    { key: 'b', label: question.option_b },
    { key: 'c', label: question.option_c },
    { key: 'd', label: question.option_d },
  ]

  function handleSelect(key: string) {
    setAnswers((prev) => ({ ...prev, [question.id]: key }))
  }

  function handleNext() {
    if (current < totalQuestions - 1) {
      setCurrent((prev) => prev + 1)
    }
  }

  function handlePrev() {
    if (current > 0) {
      setCurrent((prev) => prev - 1)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Quiz Header */}
      <div>
        <h1 className="text-xl font-bold text-white">{quiz.title}</h1>
        <p className="text-sm text-gray-400 mt-1">
          Question {current + 1} of {totalQuestions} ·{' '}
          <span className="text-yellow-400">+{quiz.xp_reward} XP available</span>
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <p className="text-white font-medium text-base leading-relaxed">
          {question.question_text}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {options.map((option) => {
            const selected = currentAnswer === option.key
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => handleSelect(option.key)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition ${
                  selected
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white'
                }`}
              >
                <span className="uppercase font-bold mr-3 text-gray-500">
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
          className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← Previous
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5">
          {questions.map((q, i) => (
            <button
              key={q.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition ${
                i === current
                  ? 'bg-emerald-400'
                  : answers[q.id]
                  ? 'bg-emerald-700'
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!currentAnswer}
            className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        ) : (
          <div>{/* Spacer — submit button is below */}</div>
        )}
      </div>

      {/* Submit Form — only shown on last question */}
      {isLast && (
        <form action={submitQuiz}>
          <input type="hidden" name="quiz_id" value={quiz.id} />
          <input type="hidden" name="total_questions" value={totalQuestions} />
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
            disabled={Object.keys(answers).length < totalQuestions}
            className="w-full py-3 text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-gray-950 rounded-xl transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {Object.keys(answers).length < totalQuestions
              ? `Answer all questions to submit (${Object.keys(answers).length}/${totalQuestions})`
              : 'Submit Quiz →'}
          </button>
        </form>
      )}
    </div>
  )
}