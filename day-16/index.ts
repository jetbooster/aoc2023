import { type Direction, type Grid2d, type GridPoint } from '../common/grid'
import { assertExists, memoise, range, readPuzzleInput } from '../common/utils'

interface LaserPoint extends GridPoint {
  movingDirection: Direction
}

const cacheKeyFunc = (grid: Grid2d, startPoint: LaserPoint): string => {
  return `_${startPoint.x}__${startPoint.y}__${startPoint.movingDirection}_`
}

const getPointInDirection = <T extends GridPoint>(grid: Grid2d, point: T, direction: Direction): GridPoint | undefined => {
  if (direction === 'E') {
    return grid.get(point.x + 1, point.y, { throwOnOOB: false }) as T
  }
  if (direction === 'W') {
    return grid.get(point.x - 1, point.y, { throwOnOOB: false }) as T
  }
  if (direction === 'N') {
    return grid.get(point.x, point.y - 1, { throwOnOOB: false }) as T
  }
  if (direction === 'S') {
    return grid.get(point.x, point.y + 1, { throwOnOOB: false }) as T
  }
  return undefined
}

let runLaserPathMemoised = (grid: Grid2d, startPoint: LaserPoint, prevPoints: Map<string, LaserPoint>): LaserPoint[] => { return [] }

const runLaserPath = (grid: Grid2d, startPoint: LaserPoint, prevPoints: Map<string, LaserPoint>): LaserPoint[] => {
  const children: LaserPoint[] = []
  switch (startPoint.value) {
    case '.': {
      const nextPoint = getPointInDirection(grid, startPoint, startPoint.movingDirection)
      if (nextPoint) {
        children.push({
          ...nextPoint,
          movingDirection: startPoint.movingDirection
        })
      }
      break
    }
    case '/': {
      switch (startPoint.movingDirection) {
        case 'E':{
          const nextPoint = getPointInDirection(grid, startPoint, 'N')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'N'
            })
          }
          break
        }
        case 'N':{
          const nextPoint = getPointInDirection(grid, startPoint, 'E')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'E'
            })
          }
          break
        }
        case 'W':{
          const nextPoint = getPointInDirection(grid, startPoint, 'S')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'S'
            })
          }
          break
        }
        case 'S':{
          const nextPoint = getPointInDirection(grid, startPoint, 'W')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'W'
            })
          }
          break
        }
      }
      break
    }
    case '\\':{
      switch (startPoint.movingDirection) {
        case 'E':{
          const nextPoint = getPointInDirection(grid, startPoint, 'S')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'S'
            })
          }
          break
        }
        case 'N':{
          const nextPoint = getPointInDirection(grid, startPoint, 'W')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'W'
            })
          }
          break
        }
        case 'W':{
          const nextPoint = getPointInDirection(grid, startPoint, 'N')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'N'
            })
          }
          break
        }
        case 'S':{
          const nextPoint = getPointInDirection(grid, startPoint, 'E')
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: 'E'
            })
          }
          break
        }
      }
      break
    }
    case '|':{
      switch (startPoint.movingDirection) {
        case 'W':
        case 'E':{
          const nextPoint1 = getPointInDirection(grid, startPoint, 'S')
          const nextPoint2 = getPointInDirection(grid, startPoint, 'N')
          if (nextPoint1) {
            children.push({
              ...nextPoint1,
              movingDirection: 'S'
            })
          }
          if (nextPoint2) {
            children.push({
              ...nextPoint2,
              movingDirection: 'N'
            })
          }
          break
        }
        case 'S':
        case 'N':{
          const nextPoint = getPointInDirection(grid, startPoint, startPoint.movingDirection)
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: startPoint.movingDirection
            })
          }
          break
        }
      }
      break
    }
    case '-':{
      switch (startPoint.movingDirection) {
        case 'S':
        case 'N':{
          const nextPoint1 = getPointInDirection(grid, startPoint, 'W')
          const nextPoint2 = getPointInDirection(grid, startPoint, 'E')
          if (nextPoint1) {
            children.push({
              ...nextPoint1,
              movingDirection: 'W'
            })
          }
          if (nextPoint2) {
            children.push({
              ...nextPoint2,
              movingDirection: 'E'
            })
          }
          break
        }
        case 'W':
        case 'E':{
          const nextPoint = getPointInDirection(grid, startPoint, startPoint.movingDirection)
          if (nextPoint) {
            children.push({
              ...nextPoint,
              movingDirection: startPoint.movingDirection
            })
          }
          break
        }
      }
      break
    }
  }
  const nextPoints: LaserPoint[] = []

  children.forEach((child) => {
    const cacheKey = cacheKeyFunc(grid, child)
    if (prevPoints.has(cacheKey)) {
      return []
    } else {
      nextPoints.push(child)
    }
  })

  prevPoints.set(cacheKeyFunc(grid, startPoint), startPoint)

  if (nextPoints.length === 0) {
    return [startPoint]
  }
  return [startPoint, ...nextPoints.map((p) => runLaserPathMemoised(grid, p, prevPoints)).flat()]
}

runLaserPathMemoised = memoise(runLaserPath, cacheKeyFunc)

const run = (grid: Grid2d, startPoint: LaserPoint): number => {
  const results = runLaserPathMemoised(grid, startPoint, new Map()).flat()
  const shortenedResults: LaserPoint[] = []
  results.forEach((p) => {
    const ppp = shortenedResults.find((pp) => p.x === pp.x && p.y === pp.y)
    if (!ppp) {
      shortenedResults.push(p)
    }
  })
  console.log(shortenedResults.length)
  return shortenedResults.length
}

const iterate = (grid: Grid2d): number => {
  // top
  const topResults = range(grid.xLen).map(x => {
    const startPoint: LaserPoint = { ...grid.get(x, 0)!, movingDirection: 'S' }
    return run(grid, startPoint)
  })
  console.log('topComplete')
  // left
  const leftResults = range(grid.yLen).map(y => {
    const startPoint: LaserPoint = { ...grid.get(0, y)!, movingDirection: 'E' }
    return run(grid, startPoint)
  })
  console.log('leftComplete')
  // bottom
  const bottomResults = range(grid.xLen).map(x => {
    const startPoint: LaserPoint = { ...grid.get(x, grid.yLen - 1)!, movingDirection: 'N' }
    return run(grid, startPoint)
  })
  console.log('bottomComplete')
  // right
  const rightResults = range(grid.yLen).map(y => {
    const startPoint: LaserPoint = { ...grid.get(grid.xLen - 1, y)!, movingDirection: 'W' }
    return run(grid, startPoint)
  })
  console.log('RightComplete')
  const results = [...topResults, ...leftResults, ...rightResults, ...bottomResults]
  return Math.max(...results)
}

const main = async (): Promise<void> => {
  const { grid } = await readPuzzleInput({ grid: true, small: false })
  assertExists(grid)
  const startPoint: LaserPoint = { ...grid.get(0, 0)!, movingDirection: 'E' }
  const results = runLaserPathMemoised(grid, startPoint, new Map()).flat()
  const shortenedResults: LaserPoint[] = []
  results.forEach((p) => {
    const ppp = shortenedResults.find((pp) => p.x === pp.x && p.y === pp.y)
    if (!ppp) {
      shortenedResults.push(p)
    }
  })
  console.log(shortenedResults.length)
  const res2 = iterate(grid)
  console.log(res2)
  shortenedResults.forEach((p) => {
    grid.replace(p, '#')
  })
  grid.print()
}

void main()
