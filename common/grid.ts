interface ForEachOptions {
  reverse: boolean
}

export type Direction = 'N' | 'S' | 'E' | 'W'

const defaultForEachOptions: ForEachOptions = {
  reverse: false
}

interface GetOptions {
  throwOnOOB?: boolean
}

const defaultGetOptions: GetOptions = {
  throwOnOOB: true
}

interface NeighbourOptions {
  includeSelf: boolean
  distance: number
  chebyshev: boolean
  includeCloserNeighbours: boolean
  diagonal: boolean
}

const defaultNeighbourOptions: NeighbourOptions = {
  includeSelf: false,
  distance: 1,
  chebyshev: true,
  includeCloserNeighbours: true,
  diagonal: true
}

export interface Position {
  x: number
  y: number
}

export interface GridPoint extends Position {
  value: string
}

export class Grid2d {
  xLen: number
  yLen: number
  data: string[][]
  constructor (data: string[][]) {
    this.xLen = data[0].length
    this.yLen = data.length
    this.data = data
  }

  offsetGrid (radius: number): Array<[x:number, y:number]> {
    const size = radius * 2 + 1
    const offsetGridElems = size * size
    return Array(offsetGridElems).fill(0).map((_, index) => {
      const xOffset = (index % size) - radius
      const yOffset = Math.floor(index / size) - radius
      return [xOffset, yOffset]
    })
  }

  getNeighbour (point: GridPoint, offset: [x:number, y:number]): GridPoint | undefined {
    return this.get(point.x + offset[0], point.y + offset[1], { throwOnOOB: false })
  }

  get (x: number, y: number, options: GetOptions = defaultGetOptions): GridPoint | undefined {
    if (x < 0 || x > this.xLen - 1 || y < 0 || y > this.yLen - 1) {
      if (options.throwOnOOB) {
        throw Error(`${x},${y} OOB of ${this.xLen},${this.yLen} Grid`)
      }
      return undefined
    }
    const point: GridPoint = {
      x,
      y,
      value: this.data[y][x]
    }
    return point
  }

  set (cell: GridPoint, newValue: string): void {
    this.data[cell.y][cell.x] = newValue
  }

  neighbours (point: GridPoint, options: Partial<NeighbourOptions> = defaultNeighbourOptions): GridPoint[] {
    const opt = { ...defaultNeighbourOptions, ...options }
    const myNeighbours: GridPoint[] = []
    const offsets = this.offsetGrid(opt.distance)
    offsets.forEach(([x, y]) => {
      if (!opt.includeSelf && x === 0 && y === 0) {
        return
      }
      if (!opt.diagonal && ((x !== 0) && (y !== 0))) {
        return
      }

      const result = this.getNeighbour(point, [x, y])
      if (result) {
        myNeighbours.push(result)
      }
    })
    return myNeighbours
  }

  forEach (callback: (item: GridPoint, index: number) => void, options: Partial<ForEachOptions> = defaultForEachOptions): void {
    const opt = { ...defaultForEachOptions, ...options }
    let index = 0
    Array(this.yLen).fill(0).forEach((_, yIndex) => {
      Array(this.xLen).fill(0).forEach((_, xIndex) => {
        const item = opt.reverse ? this.get(this.xLen - 1 - xIndex, this.yLen - 1 - yIndex) : this.get(xIndex, yIndex)
        if (item) {
          callback(item, index)
        }
        index += 1
      })
    })
  }

  map <T>(callback: (item: GridPoint, index: number) => T): T[] {
    const arr: T[] = []
    let index = 0
    Array(this.yLen).fill(0).forEach((_, yIndex) => {
      Array(this.xLen).fill(0).forEach((_, xIndex) => {
        const item = this.get(xIndex, yIndex)
        if (item) {
          arr.push(callback(item, index))
        }
        index += 1
      })
    })
    return arr
  }

  forEachColumn (callback: (item: GridPoint[], index: number) => void): void {
    let index = 0
    Array(this.xLen).fill(0).forEach((_, xIndex) => {
      const col = Array(this.yLen).fill(0).reduce<GridPoint[]>((acc, _, index) => {
        const item = this.get(xIndex, index)
        if (item) {
          acc.push(item)
          return acc
        }
        return acc
      }, [])

      callback(col, index)
      index += 1
    })
  }

  forEachRow (callback: (item: GridPoint[], index: number) => void): void {
    let index = 0
    Array(this.yLen).fill(0).forEach((_, yIndex) => {
      const row = Array(this.xLen).fill(0).reduce<GridPoint[]>((acc, _, index) => {
        const item = this.get(index, yIndex)
        if (item) {
          acc.push(item)
          return acc
        }
        return acc
      }, [])

      callback(row, index)
      index += 1
    })
  }

  getColumn (xIndex: number): Array<GridPoint | undefined> {
    if (xIndex > this.xLen - 1 || xIndex < 0) {
      throw Error('OOB')
    }
    return this.data.map((_, yIndex) => this.get(xIndex, yIndex)!)
  }

  getRow (yIndex: number): Array<GridPoint | undefined> {
    if (yIndex > this.yLen - 1 || yIndex < 0) {
      throw Error('OOB')
    }
    return this.data[yIndex].map((_, xIndex) => this.get(xIndex, yIndex)!)
  }

  insertRow (index: number, content = ' '): void {
    const newRow = Array(this.xLen).fill(content)
    this.data.splice(index, 0, newRow)
    this.yLen += 1
  }

  insertColumn (index: number, content = ' '): void {
    this.data.forEach((row) => {
      if (index > row.length - 1) {
        row.push(content)
      } else {
        row.splice(index, 0, content)
      }
    })
    this.xLen += 1
  }

  insertColumns (indexes: number[], content = ' '): void {
    // as we add columns we push the 'location' where we intended to add a column across
    indexes.forEach((index, offset) => {
      this.insertColumn(index + offset, content)
    })
  }

  insertRows (indexes: number[], content = ' '): void {
    // as we add rows we push the 'location' where we intended to add a row down
    indexes.forEach((index, offset) => {
      this.insertRow(index + offset, content)
    })
  }

  find (callback: (item: GridPoint, index: number) => boolean): GridPoint | undefined {
    let val: GridPoint | undefined
    let isTrue = false
    let index = 0
    Array(this.yLen).fill(0).forEach((_, yIndex) => {
      Array(this.xLen).fill(0).forEach((_, xIndex) => {
        if (isTrue) {
          return
        }
        const item = this.get(xIndex, yIndex)
        if (item) {
          const result = callback(item, index)
          if (result) {
            val = item
            isTrue = true
          }
        }
        index += 1
      })
    })
    return val
  }

  findAll (callback: (item: GridPoint, index: number) => boolean): GridPoint[] {
    const hits: GridPoint[] = []
    let index = 0

    Array(this.yLen).fill(0).forEach((_, yIndex) => {
      Array(this.xLen).fill(0).forEach((_, xIndex) => {
        const item = this.get(xIndex, yIndex)
        if (item) {
          const result = callback(item, index)
          if (result) {
            hits.push(item)
          }
        }
        index += 1
      })
    })
    return hits
  }

  replace (point: GridPoint, newVal: string): void {
    this.data[point.y][point.x] = newVal
    point.value = newVal
  }

  print (): void {
    console.log(this.data.map((line) => line.join('')).join('\n'))
  }
}

export type GridDir = 'N' | 'S' | 'E' | 'W' | 'Same'

// only cartesian for now
export const getDirectionFrom = (currentNode: Position, nextNode: Position): GridDir => {
  if (currentNode.x === nextNode.x) {
    if (currentNode.y === nextNode.y) {
      // same node
      return 'Same'
    }
    if (currentNode.y < nextNode.y) {
      return 'E'
    }
    if (currentNode.y > nextNode.y) {
      return 'W'
    }
  }
  if (currentNode.y === nextNode.y) {
    if (currentNode.x === nextNode.x) {
      // same node
      return 'Same'
    }
    if (currentNode.x < nextNode.x) {
      return 'S'
    }
    if (currentNode.x > nextNode.x) {
      return 'N'
    }
  }
  return 'Same'
}

export const goDirection = (currentNode: Position, direction: GridDir, distance = 1): Position => {
  switch (direction) {
    case 'N':{
      return { x: currentNode.x, y: currentNode.y - distance }
    }
    case 'S':{
      return { x: currentNode.x, y: currentNode.y + distance }
    }
    case 'E':{
      return { x: currentNode.x + distance, y: currentNode.y }
    }
    case 'W':{
      return { x: currentNode.x - distance, y: currentNode.y }
    }
    case 'Same':{
      return { x: currentNode.x, y: currentNode.y }
    }
  }
}
