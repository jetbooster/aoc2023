import { type Grid2d } from '../common/grid'
import { assertExists, readPuzzleInput, sum } from '../common/utils'

const calcSmudges = (a: string, b: string): number => {
  let foundSmudges = 0
  a.split('').forEach((aVal, index) => {
    const bVal = b[index]
    if (aVal !== bVal) {
      foundSmudges += 1
    }
  })
  return foundSmudges
}

const confirmMirrorRow = (grid: Grid2d, mirrorIndex: number, currentSmudges: number, maxSmudges: number): boolean => {
  let complete = false
  let isMirror = false
  let offset = 0
  let mySmudges = currentSmudges
  while (!complete) {
    // we already know row and row-1 match
    try {
      const back = grid.getRow(mirrorIndex - 2 - offset)
      const forward = grid.getRow(mirrorIndex + 1 + offset)
      const backString = back.map((cell) => cell?.value).join('')
      const forwardString = forward.map((cell) => cell?.value).join('')
      const numSmudges = calcSmudges(backString, forwardString)
      mySmudges += numSmudges
      if (mySmudges <= maxSmudges) {
        offset += 1
      } else {
        complete = true
        isMirror = false
      }
    } catch (e) {
      // we hit an edge before the grids stopped matching, its a mirror!
      if ((e as Error).message === 'OOB') {
        isMirror = mySmudges === maxSmudges
        complete = true
      } else {
        throw e
      }
    }
  }
  return isMirror
}

const confirmMirrorColumn = (grid: Grid2d, mirrorIndex: number, currentSmudges: number, maxSmudges: number): boolean => {
  let complete
  let isMirror = false
  let offset = 0
  let mySmudges = currentSmudges
  while (!complete) {
    // we already know row and row-1 match
    try {
      const back = grid.getColumn(mirrorIndex - 2 - offset)
      const forward = grid.getColumn(mirrorIndex + 1 + offset)
      const backString = back.map((cell) => cell?.value).join('')
      const forwardString = forward.map((cell) => cell?.value).join('')
      const numSmudges = calcSmudges(backString, forwardString)
      mySmudges += numSmudges
      if (mySmudges <= maxSmudges) {
        offset += 1
      } else {
        complete = true
        isMirror = false
      }
    } catch (e) {
      // we hit an edge before the grids stopped matching, its a mirror!
      if ((e as Error).message === 'OOB') {
        isMirror = maxSmudges === mySmudges
        complete = true
      } else {
        throw e
      }
    }
  }
  return isMirror
}

const findMirrorRow = (grid: Grid2d, smudges = 0): number | null => {
  let lastRow: string | null = null
  let mirrorRow: number | null = null
  grid.forEachRow((row, index) => {
    if (mirrorRow) {
      return
    }
    if (index > grid.yLen - 1) {
      return
    }
    const rowString = row.map((cell) => cell.value).join('')
    if (!lastRow) {
      lastRow = rowString
      return
    }
    const numSmudges = calcSmudges(rowString, lastRow)
    if (numSmudges <= smudges) {
      if (confirmMirrorRow(grid, index, numSmudges, smudges)) {
        mirrorRow = index
      }
    } else {
      lastRow = rowString
    }
  })
  return mirrorRow
}

const findMirrorColumn = (grid: Grid2d, smudges = 0): number | null => {
  let lastColumn: string | null = null
  let mirrorColumn: number | null = null
  grid.forEachColumn((column, index) => {
    if (mirrorColumn) {
      return
    }
    if (index > grid.xLen - 1) {
      return
    }
    const columnString = column.map((cell) => cell.value).join('')
    if (!lastColumn) {
      lastColumn = columnString
      return
    }
    const numSmudges = calcSmudges(columnString, lastColumn)
    if (numSmudges <= smudges) {
      if (confirmMirrorColumn(grid, index, numSmudges, smudges)) {
        mirrorColumn = index
      }
    } else {
      lastColumn = columnString
    }
  })
  return mirrorColumn
}

const findMirrors = (grid: Grid2d, index: number, smudges = 0): number => {
  const colMirrorIndex = findMirrorColumn(grid, smudges) ?? 0
  const rowMirrorIndex = findMirrorRow(grid, smudges) ?? 0
  console.log({
    colMirrorIndex,
    rowMirrorIndex
  })
  return rowMirrorIndex * 100 + colMirrorIndex
}

const main = async (): Promise<void> => {
  const { grids } = await readPuzzleInput({ small: false, multiGrid: true })
  assertExists(grids)
  const results = grids.map((map, index) => findMirrors(map, index, 0))
  console.log(`Part 1: ${sum(results)}`)
  const results2 = grids.map((map, index) => findMirrors(map, index, 1))
  console.log(`Part 2: ${sum(results2)}`)
}

void main()
