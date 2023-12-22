import { readPuzzleInput } from '../common/utils'

const replaceMap = {
  one: 'o1e',
  two: 't2o',
  three: 't3e',
  four: 'f4r',
  five: 'f5e',
  six: 's6x',
  seven: 's7n',
  eight: 'e8t',
  nine: 'n9e'

}

const replaceText = (line: string): string => {
  let tempLine = line
  Object.entries(replaceMap).forEach(([key, value]) => {
    tempLine = tempLine.replaceAll(key, String(value))
  })
  return tempLine
}

const puzzle = readPuzzleInput({ small: false })
const results = puzzle.lines?.map(replaceText).map(
  (line) => line.replace(/\D/g, '')
).map((line) => {
  const firstAndLast = `${line[0]}${line[line.length - 1]}`
  return Number(firstAndLast)
})

const reduced = results?.reduce((acc, curr) => {
  return acc + curr
}, 0)
console.log(reduced)
