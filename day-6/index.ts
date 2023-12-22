import lodash from 'lodash'
import { readPuzzleInput } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })
if (!lines) {
  throw Error('pop')
}

const bruteForceGame = (gameLength: number, recordDistance: number): number[] => {
  const waysOfWinning: number[] = []
  console.log([gameLength, recordDistance])
  Array(gameLength).fill(0).forEach((_, waitTime) => {
    // wait 0 seconds, speed is 0.
    const distanceTravelled = waitTime * (gameLength - waitTime)
    if (distanceTravelled > recordDistance) {
      waysOfWinning.push(waitTime)
    }
  })
  return waysOfWinning
}

const [, ...gameLengths] = lines[0].split(/\s+/).map(Number)
const [,...recordDistances] = lines[1].split(/\s+/).map(Number)

const games = lodash.zip(gameLengths, recordDistances) as Array<[number, number]>

const waysOfWinning = games.map(([gameLength, recordDistance]) => bruteForceGame(gameLength, recordDistance))

const productWaysOfWinning = waysOfWinning.reduce((acc, curr) => {
  return acc * curr.length
}, 1)

console.log(`Part 1: ${productWaysOfWinning}`)

// Part 2

const [,...gameLengthsStrings] = lines[0].split(/\s+/)
const gameLength = Number(''.concat(...gameLengthsStrings))
const [,...distanceStrings] = lines[1].split(/\s+/)
const distance = Number(''.concat(...distanceStrings))

const waysOfWinning2 = bruteForceGame(gameLength, distance)

console.log(`Part 2: ${waysOfWinning2.length}`)
