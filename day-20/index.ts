import lcm from 'compute-lcm'
import { writeFileSync } from 'fs'
import { sumBy } from 'lodash'
import { assertExists, range, readPuzzleInput } from '../common/utils'

type PulseType = 'high' | 'low'

interface Module {
  type: 'FlipFlop' | 'Broadcaster' | 'Conjunction'
  name: string
  inputs: string[]
  outputs: string[]
}

interface FlipFlop extends Module {
  state: boolean
}

interface Conjunction extends Module {
  inputSignals: Record<string, PulseType>
}

interface Pulse {
  type: PulseType
  source: string
  destination: string
}

type NetworkDict = Record<string, Module>

const parseBroadcaster = (line: string): Module => {
  const outputs = line.split('-> ')[1].split(', ')
  return {
    type: 'Broadcaster',
    name: 'broadcaster',
    inputs: [],
    outputs
  }
}

const parseFlipFlop = (line: string): FlipFlop => {
  const [name, o] = line.split(' -> ')
  const outputs = o.split(', ')
  return {
    type: 'FlipFlop',
    name: name.slice(1),
    inputs: [],
    outputs,
    state: false
  }
}

const parseConjunction = (line: string): Conjunction => {
  const [name, o] = line.split(' -> ')
  const outputs = o.split(', ')
  return {
    type: 'Conjunction',
    name: name.slice(1),
    inputs: [],
    outputs,
    inputSignals: {}
  }
}

const parse = (lines: string[]): NetworkDict => {
  const networkDict: NetworkDict = {}
  networkDict.rx = {
    type: 'Broadcaster',
    name: 'rx',
    inputs: [],
    outputs: []
  }
  lines.forEach((line) => {
    switch (line[0]) {
      case 'b':{
        // broadcaster
        const b = parseBroadcaster(line)
        networkDict[b.name] = b
        return
      }
      case '%':{
        // flipflop
        const f = parseFlipFlop(line)
        networkDict[f.name] = f
        return
      }
      case '&':{
        // conjunction
        const c = parseConjunction(line)
        networkDict[c.name] = c
        return
      }
      default:{
        throw Error('pop')
      }
    }
  })
  return networkDict
}

const connectInputs = (network: NetworkDict): NetworkDict => {
  Object.values(network).forEach((mod) => {
    mod.outputs.forEach((outModName) => {
      const outMod = network[outModName]
      if (!outMod) {
        return // link must be an exit node
      }
      outMod.inputs.push(mod.name)
      if (outMod.type === 'Conjunction') {
        (outMod as Conjunction).inputSignals[mod.name] = 'low'
      }
    })
  })
  return network
}

const runNetworkOnce = (n: NetworkDict, watchNodes?: Module[], signalToWatchFor?: PulseType): { highSignalsSent: number, lowSignalsSent: number, triggeredWatchNodes: Module[] } => {
  const queue: Pulse[] = [{
    source: 'button',
    destination: 'broadcaster',
    type: 'low'
  }]
  let lowSignalsSent = 1 // include initial button press
  let highSignalsSent = 0
  const triggeredWatchNodes: Module[] = []
  const increment = (p: PulseType): void => {
    if (p === 'high') {
      highSignalsSent += 1
    } else {
      lowSignalsSent += 1
    }
  }

  while (queue.length > 0) {
    const nextQueueItem = queue.shift()!
    const pulseDestination = n[nextQueueItem.destination]
    if (watchNodes && signalToWatchFor) {
      watchNodes.forEach((node) => {
        if (nextQueueItem.source === node.name && nextQueueItem.type === signalToWatchFor) {
          triggeredWatchNodes.push(node)
        }
      })
    }
    if (!pulseDestination) {
      continue
    }
    switch (pulseDestination.type) {
      case 'Broadcaster':{
        pulseDestination.outputs.forEach((output) => {
          increment(nextQueueItem.type)
          queue.push({
            source: pulseDestination.name,
            destination: output,
            type: nextQueueItem.type
          })
        })
        break
      }
      case 'FlipFlop':{
        if (nextQueueItem.type === 'low') {
          const f = pulseDestination as FlipFlop
          f.state = !f.state

          f.outputs.forEach((output) => {
            increment(f.state ? 'high' : 'low')
            queue.push({
              source: pulseDestination.name,
              destination: output,
              type: f.state ? 'high' : 'low'
            })
          })
        }
        // high pulses are ignored
        break
      }
      case 'Conjunction':{
        const c = pulseDestination as Conjunction
        c.inputSignals[nextQueueItem.source] = nextQueueItem.type
        const allHigh = Object.values(c.inputSignals).every((val) => val === 'high')
        c.outputs.forEach((output) => {
          increment(allHigh ? 'low' : 'high')
          queue.push({
            source: pulseDestination.name,
            destination: output,
            type: allHigh ? 'low' : 'high'
          })
        })
      }
    }
  }
  return {
    highSignalsSent,
    lowSignalsSent,
    triggeredWatchNodes
  }
}

const main = async (): Promise<void> => {
  const { lines } = await readPuzzleInput({ small: false })
  assertExists(lines)
  const networkDict = parse(lines)
  // inputs are not yet connected up
  connectInputs(networkDict)
  writeFileSync('./out.json', Buffer.from(JSON.stringify(networkDict)))
  const results = range(1000).map(() => {
    return runNetworkOnce(networkDict)
  })
  const high = sumBy(results, 'highSignalsSent')
  const low = sumBy(results, 'lowSignalsSent')
  console.log(`Part 1: ${high * low}`)
  writeFileSync('./out.json', Buffer.from(JSON.stringify(networkDict)))

  const n2 = connectInputs(parse(lines))
  // by analysing the graph, rx will be one when the 4 Conjunction nodes emit high
  const watchNodes = n2.rx.inputs.map((input) => n2[input].inputs).flat().map((mod) => n2[mod]) as Conjunction[]
  const cycleAt = new Map<string, number>()
  // eslint-disable-next-line no-unreachable-loop
  let i = 0

  while (cycleAt.size !== watchNodes.length) {
    const { triggeredWatchNodes } = runNetworkOnce(n2, watchNodes, 'high')
    i += 1
    if (!(i % 500)) {
      console.log(i, cycleAt.size)
    }
    triggeredWatchNodes.forEach((node) => {
      if (!cycleAt.has(node.name)) {
        cycleAt.set(node.name, i)
      }
    })
  }
  const cyclePoints = [...cycleAt.values()]
  const LCM = lcm(cyclePoints)
  console.log(`Part 2: ${LCM}`)
}

void main()
