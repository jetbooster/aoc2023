import { isEqual } from 'lodash'
import { goDirection, type Grid2d, type GridDir, type GridPoint } from './grid'

const defaultDjikstaOptions = {
  diagonals: false
}

interface DijkstraNode extends GridPoint {
  distanceFromInitial: number
}

const tentativeDistance = Number.MAX_VALUE

const getLowestTentative = <T extends DijkstraNode>(unvisited: Map<string, T>): T | null => {
  let lowest: T | null = null
  for (const node of unvisited.values()) {
    if (!lowest) {
      lowest = node
      continue
    }
    if (node.distanceFromInitial < lowest.distanceFromInitial) {
      lowest = node
    }
  }
  return lowest
}

export const solve = <T extends GridPoint>(grid: Grid2d, startPoint: T, endPoint: T, options = defaultDjikstaOptions): DijkstraNode | undefined => {
  let solved = false
  let currentNode: DijkstraNode = {
    ...startPoint,
    distanceFromInitial: 0
  }
  const unvisitedNodes = new Map<string, DijkstraNode>()
  const visitedNodes = new Map<string, DijkstraNode>()
  grid.forEach((point) => {
    unvisitedNodes.set(`${point.x}__${point.y}`, {
      ...point,
      distanceFromInitial: tentativeDistance
    })
  })
  while (!solved) {
    if (currentNode.y === endPoint.y && currentNode.x === endPoint.x) {
      solved = true
      return currentNode
    }
    const neighbours = grid.neighbours(currentNode, { diagonal: options.diagonals })
    neighbours.forEach((neighbour) => {
      const node = unvisitedNodes.get(`${neighbour.x}__${neighbour.y}`)
      if (node) {
        // This node is not yet 'complete'
        if (currentNode.distanceFromInitial + Number(neighbour.value) < node.distanceFromInitial) {
          unvisitedNodes.set(`${neighbour.x}__${neighbour.y}`, {
            ...node,
            distanceFromInitial: currentNode.distanceFromInitial + Number(neighbour.value)
          })
        }
      }
    })
    visitedNodes.set(`${currentNode.x}__${currentNode.y}`, currentNode)
    unvisitedNodes.delete(`${currentNode.x}__${currentNode.y}`)
    const nextNode = getLowestTentative(unvisitedNodes)
    if (!nextNode) {
      // run out of unvisited nodes
      throw Error('ran out of connected nodes before reaching end')
    }
    currentNode = nextNode
  }
  return undefined
}

interface DijkstraNode3 extends DijkstraNode {
  direction: GridDir
  distance: number
  parent: [number, number]
}

export const solveMax3 = <T extends GridPoint>(grid: Grid2d, startPoint: T, endPoint: T, options = defaultDjikstaOptions): number => {
  const visitedNodes = new Map<string, DijkstraNode3>()
  const queue: Record<number, DijkstraNode3[]> = {}
  const genCacheKey = (node: DijkstraNode3): string => {
    return `${node.x}__${node.y}__${node.direction}__${node.distance}`
  }
  let solved = false
  let result = 0
  const moveAndAddState = (node: DijkstraNode3, direction: GridDir, distance: number): void => {
    const { x, y } = goDirection(node, direction, 1)
    const point = grid.get(x, y, { throwOnOOB: false })
    if (point) {
      const newCost = Number(point.value) + node.distanceFromInitial
      const newNode: DijkstraNode3 = {
        ...point,
        distanceFromInitial: newCost,
        direction,
        distance,
        parent: [node.x, node.y]
      }
      if (point.x === endPoint.x && point.y === endPoint.y && newNode.distance >= 4) {
        solved = true
        result = node.distanceFromInitial + Number(point.value)
        visitedNodes.set(genCacheKey(newNode), newNode)
        return
      };
      if (!visitedNodes.has(genCacheKey(newNode))) {
        if (queue[newCost]) {
          queue[newCost].push(newNode)
        } else {
          queue[newCost] = [newNode]
        }
        visitedNodes.set(genCacheKey(newNode), newNode)
      }
    }
  }
  const currentNode: DijkstraNode3 = {
    ...startPoint,
    distanceFromInitial: 0,
    direction: 'E',
    distance: 1,
    parent: [0, 0]
  }
  const currentNode2: DijkstraNode3 = {
    ...startPoint,
    distanceFromInitial: 0,
    direction: 'S',
    distance: 1,
    parent: [0, 0]
  }

  queue[currentNode.distanceFromInitial] = [currentNode, currentNode2]

  // eslint-disable-next-line no-unmodified-loop-condition
  while (!solved) {
    const currentCost = Math.min(...Object.keys(queue).map(Number))
    const entriesAtCurrentCost = queue[currentCost]
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete queue[currentCost]
    console.log(`All nodes at cost: ${currentCost}, ${entriesAtCurrentCost.length}`)
    entriesAtCurrentCost.forEach((entry) => {
      if (solved) {
        return
      }

      (['N', 'S', 'E', 'W'] as GridDir[]).forEach((dir) => {
        if (isEqual([dir, entry.direction].sort(), ['N', 'S'])) {
          return
        }
        if (isEqual([dir, entry.direction].sort(), ['E', 'W'])) {
          return
        }
        if (entry.direction === dir) {
          if (entry.distance < 10) {
            moveAndAddState(entry, dir, entry.distance + 1)
          }
        } else {
          if (entry.distance >= 4) {
            moveAndAddState(entry, dir, 1)
          }
        }
      })
    })
  }

  return result
}
