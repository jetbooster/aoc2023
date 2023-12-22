import { Grid2d, type GridPoint } from '../common/grid'
import { readPuzzleInput } from '../common/utils'

interface ConnectedGridPoint extends GridPoint {
  next: GridPoint
  previous: GridPoint
  goingUp: boolean
}

const keyVal: Record<string, string> = {
  J: '╝',
  F: '╔',
  L: '╚',
  7: '╗',
  '|': '║',
  '-': '═'
}

const translate = (point: GridPoint): string => {
  return keyVal[point.value]
}

const { lines } = readPuzzleInput({ small: false })

if (!lines) {
  throw Error('pop')
}

const grid = new Grid2d(lines.map((line) => line.split('')))

const start = grid.find((item) => item.value === 'S')

if (!start) {
  throw Error('pop')
}

const startNeighbours = grid.neighbours(start, { diagonal: false, distance: 1 })

const isConnectedToMe = (neighbour: GridPoint, index: number): boolean => {
  switch (index) {
    case 0:{
      return ['|', '7', 'F'].includes(neighbour.value)
    }
    case 1:{
      return ['L', 'F', '-'].includes(neighbour.value)
    }
    case 2:{
      return ['J', '7', '-'].includes(neighbour.value)
    }
    case 3:{
      return ['J', 'L', '|'].includes(neighbour.value)
    }
    default: {
      throw Error('too many neighbours')
    }
  }
}

const doIConnectToThem = (me: GridPoint, index: number): boolean => {
  switch (index) {
    case 0:{
      return ['J', 'L', '|'].includes(me.value)
    }
    case 1:{
      return ['J', '7', '-'].includes(me.value)
    }
    case 2:{
      return ['L', 'F', '-'].includes(me.value)
    }
    case 3:{
      return ['|', '7', 'F'].includes(me.value)
    }
    default: {
      throw Error('too many neighbours')
    }
  }
}

// because diagonal: false, neighbours are cartesian NSEW
const connectedNeighbours = startNeighbours.filter(isConnectedToMe)
const firstPoint: ConnectedGridPoint = {
  ...start,
  next: connectedNeighbours[0],
  previous: connectedNeighbours[1],
  goingUp: true
}
console.log(firstPoint)

const walk = (current: GridPoint | ConnectedGridPoint, previous: GridPoint): ConnectedGridPoint => {
  const currentNeighbours = grid.neighbours(current, { diagonal: false }).filter((_, index) => doIConnectToThem(current, index))
  const filteredPrevious = currentNeighbours.filter((item) => {
    return !(item.x === previous.x && item.y === previous.y)
  })
  const next = filteredPrevious[0]
  if (filteredPrevious.length !== 1) {
    // something has gone weird
    // console.log({ current, previous, filteredPrevious })
    return {
      ...current,
      previous,
      next,
      goingUp: false
    }
  }
  const goingUp = next.y > current.y || previous.y > current.y

  const val: ConnectedGridPoint = {
    ...current,
    previous,
    next,
    goingUp
  }
  return val
}

const accumulator: ConnectedGridPoint[] = []
let isComplete = false
const curr = walk(firstPoint.next, firstPoint)
accumulator.push(curr)
let next = curr.next
while (!isComplete) {
  const curr = walk(next, accumulator[accumulator.length - 1])
  if (curr.value === 'S') {
    break
  }
  accumulator.push(curr)
  next = curr.next as ConnectedGridPoint

  // console.log(next)
  if (next.x === accumulator[0].x && next.y === accumulator[0].y) {
    // loop finished!
    isComplete = true
  }
}

console.log(accumulator[0], accumulator[accumulator.length - 1], accumulator.length / 2)

const grid2 = new Grid2d(lines.map((line) => line.split('')))

accumulator.forEach((item) => {
  const point = grid2.get(item.x, item.y)
  if (point) {
    grid2.replace(point, translate(point))
  }
})
grid2.forEach((point) => {
  if (keyVal[point.value] || point.value === '.') {
    grid2.replace(point, ' ')
  }
  if (point.value === 'S') {
    grid2.replace(point, '╝')
  }
})

const xyMap = new Map<string, ConnectedGridPoint>()

accumulator.forEach((point) => {
  xyMap.set(`${point.x},${point.y}`, point)
})

let counter = 0
let insideLoop = false
console.log(xyMap.size)

grid2.forEach((point) => {
  const keyName = `${point.x},${point.y}`
  if (xyMap.has(keyName)) {
    const pathPoint = xyMap.get(keyName)!
    if (pathPoint.goingUp) {
      insideLoop = !insideLoop
    }
  } else {
    if (insideLoop) {
      counter = counter += 1
    }
  }
})

console.log(counter)
