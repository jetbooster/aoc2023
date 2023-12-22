import { range } from 'lodash'
import { Grid2d, type GridPoint } from '../common/grid'
import { assertExists, readPuzzleInput, sum } from '../common/utils'

const determineMoveTo = (grid: Grid2d, cell: GridPoint, direction: 'N' | 'S' | 'E' | 'W'): GridPoint | null => {
  let x = cell.x
  let y = cell.y
  let complete = false
  let result: GridPoint | null = null
  while (!complete) {
    switch (direction) {
      case 'N':{
        if (y === 0) {
          complete = true
          break
        }
        const cellAbove = grid.get(x, y - 1)
        if (!cellAbove) {
          complete = true
          break
        }
        if (cellAbove.value === '.') {
          y = y - 1
          result = cellAbove
        } else {
          complete = true
        }
        break
      }
      case 'S':{
        if (y === grid.yLen - 1) {
          complete = true
          break
        }
        const cellBelow = grid.get(x, y + 1)
        if (!cellBelow) {
          complete = true
          break
        }
        if (cellBelow?.value === '.') {
          y = y + 1
          result = cellBelow
        } else {
          complete = true
        }
        break
      }
      case 'E':{
        if (x === grid.xLen - 1) {
          complete = true
          break
        }
        const cellRight = grid.get(x + 1, y)
        if (!cellRight) {
          complete = true
          break
        }
        if (cellRight?.value === '.') {
          x = x + 1
          result = cellRight
        } else {
          complete = true
        }
        break
      }
      case 'W':{
        if (x === 0) {
          complete = true
          break
        }
        const cellLeft = grid.get(x - 1, y)
        if (!cellLeft) {
          complete = true
          break
        }
        if (cellLeft?.value === '.') {
          x = x - 1
          result = cellLeft
        } else {
          complete = true
        }
        break
      }
    }
  }
  return result
}

const tiltDirection = (grid: Grid2d, direction: 'N' | 'S' | 'E' | 'W'): Grid2d => {
  grid.forEach((cell) => {
    if (cell.value === 'O') {
      const moveToCell = determineMoveTo(grid, cell, direction)

      if (moveToCell) {
        grid.set(moveToCell, 'O')
        grid.set(cell, '.')
      }
    }
  }, { reverse: ['E', 'S'].includes(direction) })
  return grid
}

const cycle = (grid: Grid2d): Grid2d => {
  let tempGrid = tiltDirection(grid, 'N')
  tempGrid = tiltDirection(grid, 'W')
  tempGrid = tiltDirection(grid, 'S')
  tempGrid = tiltDirection(grid, 'E')
  return tempGrid
}

const main = async (): Promise<void> => {
  const { grid } = await readPuzzleInput({ small: false, grid: true })
  assertExists(grid)
  let cycleNumber = 0
  // run 1000 times to shake out
  range(1000).forEach(() => {
    cycle(grid)
    cycleNumber += 1
  })

  const gridAt1000 = grid.print()
  const gridCache = [gridAt1000]

  let cycleFound = false
  let cycleI: number | null = null
  while (!cycleFound) {
    cycle(grid)
    cycleNumber += 1
    const cycleIndex = gridCache.findIndex((gridString) => {
      return grid.print() === gridString
    })
    if (cycleIndex !== -1) {
      cycleFound = true
      cycleI = cycleIndex
    }
  }
  console.log({ cycleNumber, cycleI })

  const target = 1_000_000_000

  // the pattern repeats every so often, figure out how often
  const cycleLength = cycleNumber - 1000 - 1 - (cycleI ?? 0)

  const cycleStart = 1000 + (cycleI ?? 0)

  // if the cycle doesn't 'start' in the right place to reach the goal, find the offset
  const offset = target % cycleStart

  console.log({ cycleLength, cycleStart, offset })

  const correctGrid = gridCache[offset]

  console.log(correctGrid)

  const newGrid2d = new Grid2d(correctGrid.split('\n').map((line) => line.split('')))

  const rockValues = newGrid2d.map((cell) => {
    if (cell.value === 'O') {
      const val = grid.yLen - cell.y
      return val
    }
    return null
  }).filter(Boolean) as number[]

  console.log(`Part 2: ${sum(rockValues)}`)
}

void main()
