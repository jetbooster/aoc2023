import lodash, { range } from 'lodash'
import { assertExists, makeString, memoise, readPuzzleInput, sum } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })
assertExists(lines)

interface Picross {
  input: string
  target: number[]
}

const parse = (line: string): Picross => {
  const [input, target] = line.split(' ')
  return {
    input,
    target: target.split(',').map(Number)
  }
}

const parse2 = (line: string): Picross => {
  const [input, target] = line.split(' ')
  return {
    input: range(5).map(() => input).join('?'),
    target: range(5).map(() => target).join(',').split(',').map(Number)
  }
}

const buildMinPicross = (n: number[]): string => {
  let string = ''
  n.forEach((cells, index) => {
    string = string.concat(makeString('#', cells))
    if (index !== n.length - 1) {
      string = string.concat('.')
    }
  })
  return string
}

const picrossMatches = (a: string, b: string): boolean => {
  if (a === b) {
    return true
  }
  const allIndexesValid = lodash.zip(a.split(''), b.split('')).every(([aCell, bCell]) => {
    if (aCell === '?' || bCell === '?') {
      return true
    }
    if (aCell === bCell) {
      return true
    }
    return false
  })
  return allIndexesValid
}

let memoisedBruteForce = (picross: Picross, parent: string): number => { return 0 }

function bruteForce (picross: Picross, parent: string): number {
  const inputLength = picross.input.length

  // to display [1,1,1] we obviously need three cells, but we also need 2 gaps, otherwise it would be [3]
  const minStringLength = sum(picross.target) + picross.target.length - 1
  if (minStringLength > inputLength) {
    // impossible to solve this picross, there are insufficient cells.
    return 0
  }
  if (minStringLength === inputLength) {
    // there is exactly one solution, but it might not match the ruletext.
    const solution = buildMinPicross(picross.target)
    if (picrossMatches(solution, picross.input)) {
      return 1
    }
    return 0
  }

  const wiggleRoom = inputLength - minStringLength + 1
  const recursionChildren = range(wiggleRoom).map((index) => {
    const firstTarget = picross.target[0]
    const testString = `${makeString('.', index)}${makeString('#', firstTarget)}`
    const firstSlice = picross.input.slice(0, testString.length)
    // we can quickly check if before diving into recursion if the given wiggle fits the ruletext
    if (picrossMatches(testString, firstSlice)) {
      const remainingSlice = picross.input.slice(testString.length)
      if (remainingSlice[0] === '#') {
        // 4 should match ####, but if the next element is also # that would be a 5, so fail.
        return 0
      }
      const newTargetArray = picross.target.slice(1)
      if (newTargetArray.length === 0) {
        // if we've reached here and there are no more targets to try to fit in, this could be a solution!
        // however, if there are any hashes left, then this is not valid as we don't have a remaining item to match with it
        if (remainingSlice.includes('#')) {
          return 0
        }
        return 1
      }

      // if we reach here, we don't need to put a
      const sliceAgain = remainingSlice.slice(1)

      return memoisedBruteForce({
        input: sliceAgain,
        target: newTargetArray
      }, testString)
    } else {
      return 0
    }
  }).flat()
  return sum(recursionChildren)
}

const parsed = lines.map(parse)
const parsed2 = lines.map(parse2)
// const result2 = parsed2.map((val) => { const res = bruteForce(val, ''); console.log(res); return res })
// console.log(`Part 2: ${sum(result2)}`)
memoisedBruteForce = memoise(bruteForce)

const result = parsed.map((picross) => memoisedBruteForce(picross, ''))
console.log(`Part 1: ${sum(result)}`)

const result2 = parsed2.map((picross) => memoisedBruteForce(picross, ''))
console.log(`Part 2: ${sum(result2)}`)
