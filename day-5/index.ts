import difference from 'lodash.difference'
import intersection from 'lodash.intersection'
import uniq from 'lodash.uniq'
import { readPuzzleInput } from '../common/utils'

interface Range {
  sourceRangeStart: number
  sourceRangeLength: number
  destinationRangeStart: number
}

interface ParsedMap {
  from: string
  to: string
  ranges: Range[]
}

const parseMap = (map: string): ParsedMap => {
  const [fromTo, ranges] = map.split(' map:')
  const [from, to] = fromTo.split('-to-')
  const rangesArray = ranges.split('\n').filter(Boolean).map((range) => {
    const [destinationRangeStart, sourceRangeStart, sourceRangeLength] = range.split(' ').map(Number)
    return {
      sourceRangeStart,
      destinationRangeStart,
      sourceRangeLength
    }
  })
  return {
    from,
    to,
    ranges: rangesArray
  }
}

const { fullFile } = readPuzzleInput({ small: false })

const splitMaps = fullFile.split('\n\n')

const [seeds, ...maps] = splitMaps

const seedsArray = seeds.split(':')[1].trim().split(' ').map((item) => Number(item))

const parsedMaps = maps.map(parseMap)

interface Seed {
  seed: number
  [key: string]: number
}

const recursivelyFindNext = (s: Seed, from: string): Seed => {
  const nextMap = parsedMaps.find((map) => map.from === from)
  if (!nextMap || !s[from]) {
    // run out of maps to traverse
    // or somehow seed does not have the current 'from' populated
    return s
  }
  const currentValue = s[from]
  let nextValue: number | null = null
  nextMap.ranges.forEach((range) => {
    if (nextValue) {
      return
    }
    if (currentValue >= range.sourceRangeStart && currentValue <= range.sourceRangeStart + range.sourceRangeLength) {
      nextValue = (currentValue - range.sourceRangeStart) + range.destinationRangeStart
    }
  })
  if (!nextValue) {
    nextValue = currentValue
  }
  s[nextMap.to] = nextValue
  return recursivelyFindNext(s, nextMap.to)
}

const completedSeeds = seedsArray.map((seed) => {
  const parsedSeed: Seed = {
    seed
  }
  const completedSeed = recursivelyFindNext(parsedSeed, 'seed')
  return completedSeed
})

const minLocation = Math.min(...completedSeeds.map((seed) => seed.location))

console.log(`Part 1: ${minLocation}`)

// Part 2

const convertFactory = (range: Range) => (number: number) => {
  const result = (number - range.sourceRangeStart) + range.destinationRangeStart
  if (result === 0) {
    console.log(range, number)
  }
  return (number - range.sourceRangeStart) + range.destinationRangeStart
}

const findSeedIntesections = (seeds: number[], range: Range): number[] => {
  const convert = convertFactory(range)
  const rangeMin = range.sourceRangeStart
  const rangeMax = range.sourceRangeStart + range.sourceRangeLength - 1
  const seedsToCheck: number[] = []
  for (let i = 0; i <= seeds.length - 2; i += 2) {
    const seedMin = seeds[i]
    const seedMax = seeds[i + 1]
    if (seedMin > rangeMax || seedMax < rangeMin) {
      // seed does not interact with this range
      seedsToCheck.push(seedMin, seedMax)
    }
    if (seedMin < rangeMin && seedMax > rangeMax) {
      // range is entirely contained by seeds
      seedsToCheck.push(seedMin, rangeMin - 1, convert(rangeMin), convert(rangeMax), rangeMax + 1, seedMax)
    }
    if (seedMin === rangeMin && seedMax > rangeMax) {
      seedsToCheck.push(convert(seedMin), convert(rangeMax), rangeMax + 1, seedMax)
    }
    if (seedMin >= rangeMin && seedMax <= rangeMax) {
      // seeds are entirely contained by range
      seedsToCheck.push(convert(seedMin), convert(seedMax))
    }
    if (seedMin < rangeMin && seedMax <= rangeMax && seedMax >= rangeMin) {
      seedsToCheck.push(seedMin, rangeMin - 1, convert(rangeMin), convert(seedMax))
    }
    if (seedMin >= rangeMin && seedMax > rangeMax && seedMin < rangeMax) {
      seedsToCheck.push(convert(seedMin), convert(rangeMax), rangeMax + 1, seedMax)
    }
  }
  const uniqSeeds = uniq(seedsToCheck)
  return uniqSeeds
}

interface SeedRange {
  seed: number[]
  [key: string]: number[]
}

const recursivelyFindNextRange = (s: SeedRange, from: string): SeedRange => {
  const nextMap = parsedMaps.find((map) => map.from === from)
  if (!nextMap || !s[from]) {
    // run out of maps to traverse
    // or somehow seed does not have the current 'from' populated
    return s
  }
  const currentValues = s[from]
  const nextValuesArrays: number[][] = []
  nextMap.ranges.forEach((range) => {
    const numbersToCheck = findSeedIntesections(currentValues, range)
    nextValuesArrays.push(numbersToCheck)
  })

  // if there are results that are the same in _every_ range, simply pass them through
  // they have been unaffected by any ranges
  const commonToAllRanges = intersection(...nextValuesArrays)
  nextValuesArrays.forEach((arr) => {
    const newFromThisRange = difference(arr, currentValues)
    commonToAllRanges.push(...newFromThisRange)
  })

  s[nextMap.to] = uniq(commonToAllRanges).sort((a, b) => a - b)

  return recursivelyFindNextRange(s, nextMap.to)
}

const seedPairs = seedsArray.reduce<number[][]>((acc, seedNum) => {
  const len = acc.length
  const last = acc[len - 1]
  if (last && last.length === 1) {
    last.push(seedNum)
    return acc
  }
  acc.push([seedNum])
  return acc
}, [])

const seedRanges = seedPairs.map(([seedStart, seedLength]) => {
  const firstSeed = seedStart
  const lastSeed = seedStart + seedLength - 1
  const seedRange: SeedRange = {
    seed: [firstSeed, lastSeed]
  }
  const completedSeedRange = recursivelyFindNextRange(seedRange, 'seed')

  return completedSeedRange
})

// const seedRange: SeedRange = {
//   seed: [1, 2]
// }
// const result = recursivelyFindNextRange(seedRange, 'seed')

console.log(seedRanges)

const min = seedRanges.map((seedRange) => {
  const minForThisSeed = seedRange.location.reduce((acc, minLocation) => {
    if (minLocation === 0) {
      return acc
    }
    if (minLocation < acc) {
      return minLocation
    }
    return acc
  }, Number.MAX_VALUE)
  return minForThisSeed
})

console.log(min.sort((a, b) => a - b))
