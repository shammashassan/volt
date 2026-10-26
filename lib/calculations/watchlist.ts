/**
 * Pure testable domain calculations for media watchlist statistics.
 */

export interface WatchlistStats {
  total: number
  completed: number
  inProgress: number
  planned: number
  completionRate: number
  averageScore: number
}

/**
 * Calculates completion rate as a percentage (0 to 100).
 */
export function calculateCompletionRate(total: number, completed: number): number {
  if (total <= 0) return 0
  return Math.round((completed / total) * 1000) / 10
}

/**
 * Calculates average score given an array of numeric ratings.
 */
export function calculateAverageRating(scores: number[]): number {
  const validScores = scores.filter((s) => typeof s === "number" && !Number.isNaN(s) && s > 0)
  if (validScores.length === 0) return 0
  const sum = validScores.reduce((acc, score) => acc + score, 0)
  return Math.round((sum / validScores.length) * 10) / 10
}

/**
 * Aggregates a list of watchlist items into overall summary statistics.
 */
export function calculateWatchlistStats(
  items: Array<{ status?: string; score?: number | null }>
): WatchlistStats {
  const total = items.length
  let completed = 0
  let inProgress = 0
  let planned = 0
  const scores: number[] = []

  for (const item of items) {
    if (item.status === "completed") {
      completed++
    } else if (item.status === "in_progress") {
      inProgress++
    } else if (item.status === "planned") {
      planned++
    }

    if (typeof item.score === "number" && item.score > 0) {
      scores.push(item.score)
    }
  }

  return {
    total,
    completed,
    inProgress,
    planned,
    completionRate: calculateCompletionRate(total, completed),
    averageScore: calculateAverageRating(scores),
  }
}
