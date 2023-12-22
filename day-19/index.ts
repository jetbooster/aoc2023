import { cloneDeep, sum } from 'lodash'
import { assertExists, product, readPuzzleInput } from '../common/utils'

interface Test {
  attributeToCheck: keyof Part | null
  operation: '>' | '<' | null
  testAgainst: number | null
  destination: string
}

interface Flow {
  flowName: string
  tests: Test[]
}

interface Part {
  x: number
  m: number
  a: number
  s: number
}

type Restrictions = Record<keyof Part, { min: number | null, max: number | null }>
type FlowDict = Record<string, Test[]>

const parseTest = (string: string): Test => {
  if (string.includes(':')) {
    const [rest, destination] = string.split(':')
    if (rest.includes('>')) {
      const [attributeToCheck, testAgainst] = rest.split('>') as [keyof Part, number]
      return {
        attributeToCheck, testAgainst: Number(testAgainst), operation: '>', destination
      }
    }
    if (rest.includes('<')) {
      const [attributeToCheck, testAgainst] = rest.split('<') as [keyof Part, number]
      return {
        attributeToCheck, testAgainst: Number(testAgainst), operation: '<', destination
      }
    }
    throw Error(`Failed to parse ${string}`)
  } else {
    return {
      destination: string,
      attributeToCheck: null,
      testAgainst: null,
      operation: null
    }
  }
}

const parseFlow = (string: string): Flow => {
  const [flowName, rest] = string.split('{')
  const testStrings = rest.slice(0, rest.length - 1).split(',')
  const tests = testStrings.map(parseTest)
  return {
    flowName,
    tests
  }
}
const parsePart = (string: string): Part => {
  const [x, m, a, s] = string.match(/(\d+)/g)!

  return {
    x: Number(x),
    m: Number(m),
    a: Number(a),
    s: Number(s)
  }
}

const runTest = (test: Test, part: Part): string | null => {
  if (!test.operation || !test.attributeToCheck || !test.testAgainst) {
    return test.destination
  }
  switch (test.operation) {
    case '<':{
      if (part[test.attributeToCheck as keyof Part] < test.testAgainst) {
        return test.destination
      }
      return null
    }
    case '>':{
      if (part[test.attributeToCheck as keyof Part] > test.testAgainst) {
        return test.destination
      }
      return null
    }
  }
}

const recursiveRunTest = (testsDict: FlowDict, part: Part, testName: string = 'in'): 'A' | 'R' => {
  const tests = testsDict[testName]
  let result: string | null = null
  for (let i = 0; i < tests.length; i++) {
    const testToRun = tests[i]
    result = runTest(testToRun, part)
    if (result && ['A', 'R'].includes(result)) {
      return result as 'A' | 'R'
    }
    if (result) {
      break
    }
  }
  if (!result) {
    throw Error(`No result after looped through ${JSON.stringify(tests)}`)
  }
  return recursiveRunTest(testsDict, part, result)
}

const modifyRestrictions = (r: Restrictions, test: Test): Restrictions => {
  if (!test.operation || !test.attributeToCheck || !test.testAgainst) {
    return r
  }

  const { min: currMin, max: currMax } = r[test.attributeToCheck as keyof Part]
  switch (test.operation) {
    case '<':{
      const newMax = test.testAgainst - 1
      if (!currMax || newMax < currMax) {
        return {
          ...r,
          [test.attributeToCheck as keyof Part]: {
            min: currMin,
            max: newMax
          }
        }
      }
      if (newMax > currMax) {
        // the existing limit is already more restrictive
        return r
      }
      return r
    }
    case '>':{
      const newMin = test.testAgainst + 1
      if (!currMin || newMin > currMin) {
        return {
          ...r,
          [test.attributeToCheck as keyof Part]: {
            min: newMin,
            max: currMax
          }
        }
      }
      if (newMin < currMin) {
        // the existing limit is already more restrictive
        return r
      }
      return r
    }
  }
}

const invertTest = (r: Restrictions, prevR: Restrictions, test: Test): Restrictions => {
  const newRestrictions = cloneDeep(r)

  switch (test.operation) {
    case '<':{
      const newTest: Test = {
        operation: '>',
        attributeToCheck: test.attributeToCheck,
        testAgainst: test.testAgainst ? test.testAgainst - 1 : null,
        destination: 'N/A'
      }
      const currentMax = newRestrictions[test.attributeToCheck as keyof Part].max
      const previousMax = prevR[test.attributeToCheck as keyof Part].max
      if (currentMax && test.testAgainst === currentMax + 1) {
        newRestrictions[test.attributeToCheck as keyof Part].max = previousMax
      }
      return modifyRestrictions(newRestrictions, newTest)
    }
    case '>':{
      const newTest: Test = {
        operation: '<',
        attributeToCheck: test.attributeToCheck,
        testAgainst: test.testAgainst ? test.testAgainst + 1 : null,
        destination: 'N/A'
      }
      const currentMin = newRestrictions[test.attributeToCheck as keyof Part].min
      const previousMin = prevR[test.attributeToCheck as keyof Part].min
      if (currentMin && test.testAgainst === currentMin - 1) {
        newRestrictions[test.attributeToCheck as keyof Part].min = previousMin
      }
      return modifyRestrictions(newRestrictions, newTest)
    }
  }

  return newRestrictions
}

const walkTree = (testDict: FlowDict, restrictions: Restrictions, depth = 0, testName = 'in'): Restrictions[] => {
  const tests = testDict[testName]
  console.log(Array(depth).fill(' ').join('').concat(testName))
  if (testName === 'A') {
    return [restrictions]
  }
  if (testName === 'R') {
    return []
  }

  let invertedRestrictions = cloneDeep(restrictions)
  return tests.map((test) => {
    const modifiedRestrictions = modifyRestrictions(invertedRestrictions, test)
    invertedRestrictions = invertTest(modifiedRestrictions, invertedRestrictions, test)
    console.log({ test, modifiedRestrictions, invertedRestrictions })
    return walkTree(testDict, modifiedRestrictions, depth + 1, test.destination)
  }).flat()
}

const calculatePossibleParts = (r: Restrictions): number => {
  const posibilitiesForEachAxis: number[] = Object.values(r).map(({ min, max }) => {
    if (!min && !max) {
      return 4000
    }
    if (!min) {
      return max as number
    }
    if (!max) {
      return 4001 - min
    }
    if (min < max) {
      return max - min + 1
    }
    if (max < min) {
      return max + (4001 - min)
    }
    if (max === min) {
      return 1
    }
    throw Error(`How ${min},${max}`)
  })
  console.log({ r, posibilitiesForEachAxis })
  return product(posibilitiesForEachAxis)
}

const main = async (): Promise<void> => {
  const { multiLine } = await readPuzzleInput({ small: false, multiLine: true })
  assertExists(multiLine)
  const [flows, parts] = multiLine
  const parsedFlows = flows.map(parseFlow)
  const flowDict: FlowDict = {}
  parsedFlows.forEach((flow) => {
    flowDict[flow.flowName] = flow.tests
  })
  const parsedParts = parts.map(parsePart)
  const results = parsedParts.filter((part) => {
    return recursiveRunTest(flowDict, part) === 'A'
  })
  console.log(`Part 1: ${sum(results.map((part) => sum([...Object.values(part)])))}`)
  const restriction: Restrictions = {
    x: {
      max: null,
      min: null
    },
    m: {
      max: null,
      min: null
    },
    a: {
      max: null,
      min: null
    },
    s: {
      max: null,
      min: null
    }
  }
  // result is all tree paths that end in A
  const result = walkTree(flowDict, restriction)
  console.log(result)
  const totalPossibleParts = result.map(calculatePossibleParts)
  console.log(totalPossibleParts)
  console.log(`Part 2: ${sum(totalPossibleParts)}`)
}

void main()
