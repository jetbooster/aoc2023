import { Grid2d, type GridPoint } from '../common/grid'
import { readPuzzleInput } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })
if (!lines) {
  throw Error('pop')
}

const isNumerical = (item: GridPoint): boolean => {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].includes(Number(item.value))
}

const recursiveGetDigits = (grid: Grid2d, item: GridPoint, accumulator: { items: GridPoint[], value: string }): { items: GridPoint[], value: string } => {
  if (isNumerical(item)) {
    accumulator.items.push(item)
    accumulator.value = accumulator.value.concat(item.value)
    const nextItem = grid.getNeighbour(item, [1, 0])
    if (nextItem) {
      return recursiveGetDigits(grid, nextItem, accumulator)
    }
  }
  return accumulator
}

const arrayOfArrays = lines.map((line) => line.split(''))

const grid = new Grid2d(arrayOfArrays)

const validValues: Array<{
  items: GridPoint[]
  value: string
}> = []

let skipNumber = 0
grid.forEach((item) => {
  if (skipNumber > 0) {
    skipNumber -= 1
    return
  }
  const accumulator = {
    items: [],
    value: ''
  }
  const newAccumulator = recursiveGetDigits(grid, item, accumulator)
  if (newAccumulator.items.length) {
    skipNumber = (newAccumulator.items.length - 1)
    validValues.push(newAccumulator)
    console.log(newAccumulator.items.length)
  }
})

// anything except digit or .
const symbolsRegex = /[^.\d]/

const numbersWithAdjacentSymbol = validValues.filter((validValueSet) => {
  return validValueSet.items.some((item) => {
    return grid.neighbours(item, { distance: 1 }).some((item) => {
      return symbolsRegex.test(item.value)
    })
  })
})

const sum = numbersWithAdjacentSymbol.reduce((acc, curr) => {
  return acc + Number(curr.value)
}, 0)

console.log(`Part 1: ${sum}`)

const gearLocations: Array<{ point: GridPoint, adjacentItems: Array<{ items: GridPoint[], value: string }> }> = []

validValues.forEach((itemSet) => {
  itemSet.items.forEach((item) => {
    const adjacentGears = grid.neighbours(item, { distance: 1 }).filter((item) => {
      return item.value === '*'
    })
    adjacentGears.forEach((gear) => {
      const gearIndex = gearLocations.findIndex((g) => g.point.x === gear.x && g.point.y === gear.y)
      if (gearIndex !== -1) {
        const alreadyAdded = gearLocations[gearIndex].adjacentItems.find((val) => val.value === itemSet.value)
        if (!alreadyAdded) {
          gearLocations[gearIndex].adjacentItems.push(itemSet)
        }
      } else {
        gearLocations.push({
          point: gear,
          adjacentItems: [
            itemSet
          ]
        })
      }
    })
  })
})

const gearsWithTwoNeighbours = gearLocations.filter((gear) => {
  return gear.adjacentItems.length === 2
})

const sumOfProducts = gearsWithTwoNeighbours.reduce((acc, curr) => {
  return acc + (Number(curr.adjacentItems[0].value) * Number(curr.adjacentItems[1].value))
}, 0)

console.log(`Part 2: ${sumOfProducts}`)
