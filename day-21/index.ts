import { cloneDeep } from 'lodash'
import { type GridPoint } from '../common/grid'
import { assertExists, range, readPuzzleInput } from '../common/utils'

const mapKey = (g: GridPoint): string => {
  return `${g.x}__${g.y}`
}

const main = async (): Promise<void> => {
  const { grid } = await readPuzzleInput({ small: false, grid: true })
  assertExists(grid)
  const startCell = grid.find((cell) => {
    return cell.value === 'S'
  })!

  let currentCells = new Map<string, GridPoint>()
  const distance = new Map<string, number>()
  const nextCells = new Map<string, GridPoint>()
  nextCells.set(mapKey(startCell), startCell)
  range(150).forEach((i) => {
    currentCells = cloneDeep(nextCells)
    nextCells.clear()
    for (const [key, val] of currentCells) {
      const neighbours = grid.neighbours(val, { diagonal: false })
      neighbours.forEach((neighbour) => {
        if (neighbour.value !== '#') {
          nextCells.set(mapKey(neighbour), neighbour)
          if (!distance.has(mapKey(neighbour))) {
            distance.set(mapKey(neighbour), Math.abs(65 - neighbour.x) + Math.abs(65 - neighbour.y))
          }
        }
      })
      currentCells.delete(key)
    }
  })
  console.log(`Part 1: ${nextCells.size}`)

  const target = 26501365
  const n = (target - 65) / 131
  const oddFull = 7282
  const evenFull = 7406
  const evenCorner = 3769
  const oddCorner = 3583
  const result = ((n + 1) ** 2) * oddFull + (n ** 2) * evenFull + n * evenCorner - (n + 1) * oddCorner
  console.log(`Part 2: ${result}`)
}

void main()
