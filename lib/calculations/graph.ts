/**
 * Pure testable domain calculations for graph network metrics.
 */

export interface GraphMetrics {
  nodeCount: number
  edgeCount: number
  density: number
  isolatedNodeCount: number
  averageDegree: number
}

/**
 * Calculates graph density: (2 * E) / (V * (V - 1)) for undirected graphs.
 */
export function calculateGraphDensity(nodeCount: number, edgeCount: number): number {
  if (nodeCount <= 1) return 0
  const maxPossibleEdges = (nodeCount * (nodeCount - 1)) / 2
  return Math.round((edgeCount / maxPossibleEdges) * 1000) / 1000
}

/**
 * Calculates node degree map (number of edges incident to each vertex).
 */
export function calculateNodeDegrees(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>
): Map<string, number> {
  const degrees = new Map<string, number>()
  for (const id of nodeIds) {
    degrees.set(id, 0)
  }

  for (const edge of edges) {
    const srcDeg = degrees.get(edge.source)
    if (srcDeg !== undefined) {
      degrees.set(edge.source, srcDeg + 1)
    }
    const tgtDeg = degrees.get(edge.target)
    if (tgtDeg !== undefined) {
      degrees.set(edge.target, tgtDeg + 1)
    }
  }

  return degrees
}

/**
 * Computes global graph network metrics.
 */
export function computeGraphMetrics(
  nodeIds: string[],
  edges: Array<{ source: string; target: string }>
): GraphMetrics {
  const nodeCount = nodeIds.length
  const edgeCount = edges.length
  const degrees = calculateNodeDegrees(nodeIds, edges)

  let isolatedCount = 0
  let degreeSum = 0
  for (const deg of degrees.values()) {
    if (deg === 0) isolatedCount++
    degreeSum += deg
  }

  const averageDegree = nodeCount > 0 ? Math.round((degreeSum / nodeCount) * 10) / 10 : 0

  return {
    nodeCount,
    edgeCount,
    density: calculateGraphDensity(nodeCount, edgeCount),
    isolatedNodeCount: isolatedCount,
    averageDegree,
  }
}
