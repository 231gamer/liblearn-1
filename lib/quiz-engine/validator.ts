type ValidatedAnswers = {
  valid: boolean
  answers: Record<string, string>
  error?: string
}

const VALID_OPTIONS = new Set(['a', 'b', 'c', 'd'])

export function validateAnswers(
  formData: FormData,
  questionIds: string[]
): ValidatedAnswers {
  const answers: Record<string, string> = {}

  for (const id of questionIds) {
    const raw = formData.get(`answer_${id}`)

    if (!raw || typeof raw !== 'string') {
      return {
        valid: false,
        answers: {},
        error: `Missing answer for question ${id}`,
      }
    }

    const answer = raw.trim().toLowerCase()

    if (!VALID_OPTIONS.has(answer)) {
      return {
        valid: false,
        answers: {},
        error: `Invalid answer value: ${answer}`,
      }
    }

    answers[id] = answer
  }

  return { valid: true, answers }
}