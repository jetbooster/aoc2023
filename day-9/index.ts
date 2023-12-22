import lodash from 'lodash'
import { readPuzzleInput } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })

if (!lines) {
  throw Error('pop')
}

const parsedLines = lines.map((line) => line.split(' ').map(Number))

console.log(parsedLines)

const recursiveDetectNext = (numbers: number[]): number[] => {
  const diffArray = []
  for (let i = 0; i < numbers.length - 1; i++) {
    diffArray.push(numbers[i + 1] - numbers[i])
  }
  if (diffArray.every((item) => item === 0)) {
    numbers.push(numbers[numbers.length - 1])
    return numbers
  }
  const nextLayer = recursiveDetectNext(diffArray)
  numbers.push(nextLayer[nextLayer.length - 1] + numbers[numbers.length - 1])
  return numbers
}

const recursiveDetectPrevious = (numbers: number[]): number[] => {
  const diffArray = []
  console.log(numbers)
  for (let i = 1; i < numbers.length; i++) {
    diffArray.push(numbers[i] - numbers[i - 1])
  }
  if (diffArray.every((item) => item === 0)) {
    const newNumbers = [numbers[0], ...numbers]
    return newNumbers
  }
  const nextLayer = recursiveDetectPrevious(diffArray)
  const newNumbers = [numbers[0] - nextLayer[0], ...numbers]
  return newNumbers
}

const total = lodash.sum(parsedLines.map((line) => recursiveDetectNext(line)).map((line) => line[line.length - 1]))

console.log(`Part 1: ${total}`)

console.log(recursiveDetectPrevious(parsedLines[2]))

const total2 = lodash.sum(parsedLines.map(line => recursiveDetectPrevious(line)).map((line) => line[0]))

console.log(`Part 2: ${total2}`)
