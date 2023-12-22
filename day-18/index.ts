import { goDirection, type GridDir, type Position } from '../common/grid'
import { assertExists, determinant, readPuzzleInput } from '../common/utils'

interface Instruction {
  direction: GridDir
  distance: number
  colour: string
  cDist: number
  cDir: GridDir
}

const dirMap: Record<string, GridDir> = {
  U: 'N',
  D: 'S',
  L: 'W',
  R: 'E',
  0: 'E',
  1: 'S',
  2: 'W',
  3: 'N'
}

const parseInstruction = (line: string): Instruction => {
  const [dir, dist, colour] = line.split(' ')
  const digits = /[\da-f]+/.exec(colour)?.[0]
  if (!digits) {
    throw Error('pop')
  }

  return {
    direction: dirMap[dir],
    distance: Number(dist),
    colour,
    cDist: parseInt(digits.slice(0, 5), 16),
    cDir: dirMap[digits[5]]
  }
}

const main = async (): Promise<void> => {
  const { lines } = await readPuzzleInput({ small: false })
  assertExists(lines)
  const instructions = lines.map(parseInstruction)
  let startPoint: Position = {
    x: 0,
    y: 0
  }
  let detCounter = 0
  let peremiterLength = 0
  instructions.forEach((instruction) => {
    const nextPoint = goDirection(startPoint, instruction.direction, instruction.distance)
    peremiterLength += instruction.distance
    // Apply shoelace Formula
    detCounter += determinant([[startPoint.x, nextPoint.x], [startPoint.y, nextPoint.y]])
    startPoint = nextPoint
  })
  const internalArea = detCounter / 2
  // apply pick's Formula
  const internalIncludingPerem = internalArea + peremiterLength / 2 + 1
  console.log(`Part 1: ${internalIncludingPerem}`)

  startPoint = {
    x: 0,
    y: 0
  }
  detCounter = 0
  peremiterLength = 0
  instructions.forEach((instruction) => {
    const nextPoint = goDirection(startPoint, instruction.cDir, instruction.cDist)
    peremiterLength += instruction.cDist
    // Apply shoelace Formula
    detCounter += determinant([[startPoint.x, nextPoint.x], [startPoint.y, nextPoint.y]])
    startPoint = nextPoint
  })
  const internalArea2 = detCounter / 2
  // apply pick's Formula
  const internalIncludingPerem2 = internalArea2 + peremiterLength / 2 + 1
  console.log(`Part 2: ${internalIncludingPerem2}`)
}

void main()
