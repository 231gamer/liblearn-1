export type ScoreResult = {
  score: number
  total: number
  percent: number
  xpEarned: number
  isPerfect: boolean
  isFirstAttempt: boolean
}

type ScorerOptions = {
  answers: Record<string, string>        // { [questionId]: 'a' | 'b' | 'c' | 'd' }
  correctAnswers: Record<string, string> // { [questionId]: 'a' | 'b' | 'c' | 'd' }
  xpReward: number
  isFirstAttempt: boolean
}

export function calculateScore(options: ScorerOptions): ScoreResult {
  const { answers, correctAnswers, xpReward, isFirstAttempt } = options

  const total = Object.keys(correctAnswers).length
  let score = 0

  for (const questionId of Object.keys(correctAnswers)) {
    if (answers[questionId] === correctAnswers[questionId]) {
      score++
    }
  }

  const percent = total > 0 ? Math.round((score / total) * 100) : 0
  const isPerfect = score === total

  let xpEarned = 0

  if (isFirstAttempt) {
    // Base XP proportional to score
    const baseXp = Math.round((score / total) * xpReward)

    // Minimum 1 XP for completing (even if score is 0)
    const withFloor = Math.max(baseXp, 1)

    // 20% bonus for perfect score
    const withBonus = isPerfect ? Math.round(withFloor * 1.2) : withFloor

    xpEarned = withBonus
  }
  // Retakes earn 0 XP — anti-farming

  return {
    score,
    total,
    percent,
    xpEarned,
    isPerfect,
    isFirstAttempt,
  }
}

export function calculateLevel(totalXp: number): number {
  return Math.floor(totalXp / 100) + 1
}

export function xpForNextLevel(level: number): number {
  return level * 100
}

export function getLevelProgress(xp: number, level: number): number {
  const previousLevelXp = (level - 1) * 100
  const nextLevelXp = xpForNextLevel(level)
  const progress = ((xp - previousLevelXp) / (nextLevelXp - previousLevelXp)) * 100
  return Math.min(Math.max(progress, 0), 100)
}