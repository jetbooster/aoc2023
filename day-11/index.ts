import { sum } from 'lodash'
import { type GridPoint } from '../common/grid'
import { readPuzzleInput } from '../common/utils'

const { grid } = readPuzzleInput({ small: false, grid: true })
if (!grid) {
  throw Error('pop')
}

const emptyRows: number[] = []
grid.forEachRow((row) => {
  if (row.every((cell) => cell.value === '.')) {
    emptyRows.push(row[0].y)
  }
})

const emptyColumns: number[] = []
grid.forEachColumn((col) => {
  if (col.every((cell) => cell.value === '.')) {
    emptyColumns.push(col[0].x)
  }
})

grid.insertColumns(emptyColumns, '.')
grid.insertRows(emptyRows, '.')

const stars = grid.findAll((point) => point.value === '#')
console.log(`${stars.length} stars`)

const starDistanceMap = new Map<string, number>()
stars.forEach((star) => {
  stars.forEach((star2) => {
    if (star.x === star2.x && star.y === star2.y) {
      // don't check distance to self
      return
    }
    const starKey = `(${star.x},${star.y})-(${star2.x},${star2.y})`
    const reverseStarKey = `(${star2.x},${star2.y})-(${star.x},${star.y})`
    if (starDistanceMap.has(reverseStarKey)) {
      // already checked the reverse pair
      return
    }
    starDistanceMap.set(starKey, Math.abs(star.x - star2.x) + Math.abs(star.y - star2.y))
  })
})
console.log(`Part 1: ${sum([...starDistanceMap.values()])}`)

starDistanceMap.clear()

// Part 2

const { grid: grid2 } = readPuzzleInput({ small: false, grid: true })
console.log(grid2)
if (!grid2) {
  throw Error('pop')
}

const howManyGapsCrossed = (point1: GridPoint, point2: GridPoint, gapRowIndexes: number[], gapColumnIndexes: number[]): number => {
  let xGapsCrossed = 0
  let yGapsCrossed = 0
  if (point1.x === point2.x) {
    xGapsCrossed = 0
  } else {
    const sortedPoints = [point1.x, point2.x].sort((a, b) => a - b)
    xGapsCrossed = gapColumnIndexes.reduce((acc, gapCol) => {
      if (gapCol > sortedPoints[0] && gapCol < sortedPoints[1]) {
        return acc + 1
      }
      return acc
    }, 0)
    console.log({ sortedPoints, gapColumnIndexes, xGapsCrossed })
  }
  if (point1.y === point2.y) {
    yGapsCrossed = 0
  } else {
    const sortedPoints = [point1.y, point2.y].sort((a, b) => a - b)
    console.log(sortedPoints)
    yGapsCrossed = gapRowIndexes.reduce((acc, gapRow) => {
      if (gapRow > sortedPoints[0] && gapRow < sortedPoints[1]) {
        return acc + 1
      }
      return acc
    }, 0)
  }
  return xGapsCrossed + yGapsCrossed
}

const stars2 = grid2.findAll((point) => point.value === '#')

const EXPANSION = 1_000_000 - 1 // it went from 1 to 1_000_000, so there is 999_999 additional distance to cover

stars2.forEach((star) => {
  stars2.forEach((star2) => {
    if (star.x === star2.x && star.y === star2.y) {
      // don't check distance to self
      return
    }
    const starKey = `(${star.x},${star.y})-(${star2.x},${star2.y})`
    const reverseStarKey = `(${star2.x},${star2.y})-(${star.x},${star.y})`
    if (starDistanceMap.has(reverseStarKey)) {
      // already checked the reverse pair
      return
    }
    const gapsCrossed = howManyGapsCrossed(star, star2, emptyRows, emptyColumns)
    starDistanceMap.set(starKey, Math.abs(star.x - star2.x) + Math.abs(star.y - star2.y) + gapsCrossed * EXPANSION)
  })
})

console.log(`Part 2: ${sum([...starDistanceMap.values()])}`)
