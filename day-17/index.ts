import { solveMax3 } from '../common/dijkstra'
import { assertExists, readPuzzleInput } from '../common/utils'

const main = async (): Promise<void> => {
  const { grid } = await readPuzzleInput({ small: false, grid: true })
  assertExists(grid)
  const xMax = grid.xLen - 1
  const yMax = grid.yLen - 1
  const start = grid.get(0, 0)!
  const end = grid.get(xMax, yMax)!
  const result = solveMax3(grid, start, end)
  console.log(result)
}

void main()
