import lcm from 'compute-lcm'
import { readPuzzleInput } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })
if (!lines) {
  throw Error('pop')
}

const instructions = lines[0]
const nodes = lines.slice(1).reduce<Record<string, [string, string]>>((acc, curr) => {
  const [nodeName, directions] = curr.split(' = ')
  acc[nodeName] = directions.replace(/[()]/g, '').split(', ') as [string, string]
  return acc
}, {})

let steps = 0
let currentNode = 'AAA'
while (currentNode !== 'ZZZ') {
  const currentInstruction = instructions[steps % instructions.length]
  if (currentInstruction === 'L') {
    currentNode = nodes[currentNode][0]
  } else if (currentInstruction === 'R') {
    currentNode = nodes[currentNode][1]
  }
  steps += 1
}

// console.log(`Part 1: ${steps}`)

// Part 2

steps = 0
console.log(Object.keys(nodes))
const startingNodes = Object.keys(nodes).filter((node) => node.endsWith('A'))
console.log(startingNodes)

const cycleDetectResults = startingNodes.map((node) => {
  let AtoZsteps = 0
  let ZtoZsteps = 0
  let currentNode = node
  while (!currentNode.endsWith('Z')) {
    const currentInstruction = instructions[AtoZsteps % instructions.length]
    if (currentInstruction === 'L') {
      currentNode = nodes[currentNode][0]
    } else if (currentInstruction === 'R') {
      currentNode = nodes[currentNode][1]
    }
    AtoZsteps += 1
  }
  let ignoreOnce = true
  while (ignoreOnce || !currentNode.endsWith('Z')) {
    ignoreOnce = false
    const currentInstruction = instructions[ZtoZsteps % instructions.length]
    if (currentInstruction === 'L') {
      currentNode = nodes[currentNode][0]
    } else if (currentInstruction === 'R') {
      currentNode = nodes[currentNode][1]
    }
    ZtoZsteps += 1
  }
  return {
    AtoZsteps,
    ZtoZsteps
  }
})

// if the time it takes for one cycle equals the time it takes to get _into_ a cycle,
// all the cycles will be 'synced'.
// we can use lcm.
if (cycleDetectResults.every(({ AtoZsteps, ZtoZsteps }) => AtoZsteps === ZtoZsteps)) {
  const cycleLengths = cycleDetectResults.map((res) => res.AtoZsteps)

  const result = lcm(cycleLengths)
  console.log(`Part 2: ${result}`)
}
