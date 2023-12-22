/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import axios from 'axios'
import { readFileSync, statSync, writeFileSync } from 'fs'
import { basename, join } from 'path'
import { Grid2d } from './grid'

interface ReadPuzzInput {
  small?: boolean
  readByLine?: boolean
  grid?: boolean
  multiGrid?: boolean
  multiLine?: boolean
  seperator?: string
}

const defaultOptions: ReadPuzzInput = {
  small: false,
  readByLine: true,
  grid: false,
  multiGrid: false,
  multiLine: false,
  seperator: '\n\n'
}

export const readPuzzleInput = async (opts: ReadPuzzInput = defaultOptions): Promise<{
  lines?: string[]
  grid?: Grid2d
  grids?: Grid2d[]
  multiLine?: string[][]
  fullFile: string
}> => {
  const { small, readByLine, grid, multiGrid, seperator, multiLine } = { ...defaultOptions, ...opts }
  const path = !small ? join(process.env.PWD!, './input.txt') : join(process.env.PWD!, './input-small.txt')

  try {
    statSync(path)
  } catch (e) {
    console.log('Getting todays input file')
    if (!process.env.AOC_SESSION_TOKEN || small) {
      throw Error('No session token, or asking for small input')
    }
    const res = /\d+/.exec(basename(process.env.PWD!))!

    await axios.get(`https://adventofcode.com/2023/day/${res[0]}/input`, {
      headers: {
        Cookie: `session=${process.env.AOC_SESSION_TOKEN}`
      },
      httpAgent: 'AoC Fetch, fetches once. contact: jarvisam@gmail.com'
    }).then(async (result) => {
      writeFileSync(path, result.data)
    }).catch((e) => {
      console.log(e)
    })
  }
  const fyl = readFileSync(path, 'utf-8')
  if (readByLine ?? grid ?? multiGrid ?? multiLine) {
    if ((multiGrid || multiLine) && seperator) {
      const lineGroups = fyl.split(seperator).filter(Boolean)
      if (multiLine) {
        return {
          fullFile: fyl,
          multiLine: lineGroups.map((lineGroup) => {
            return lineGroup.split('\n')
          })
        }
      }
      const grids = lineGroups.map((lineGroup) => {
        const lines = lineGroup.split('\n')
        return new Grid2d(lines.map((line) => line.split('')))
      })
      return {
        fullFile: fyl,
        grids
      }
    }
    const lines = fyl.split('\n').filter(Boolean)
    if (grid) {
      return {
        grid: new Grid2d(lines.map((line) => line.split(''))),
        lines,
        fullFile: fyl
      }
    }
    return {
      lines,
      fullFile: fyl
    }
  }
  return {
    fullFile: fyl
  }
}

export const sum = (items: string[] | number[]): number => {
  return items.reduce<number>((acc, item) => {
    if (typeof item === 'string') {
      return acc + Number(item)
    } else if (typeof item === 'number') {
      return acc + item
    }
    throw Error('Attemped to sum non-numerical data')
  }, 0)
}

export const sumObject = <T>(items: T[], key: keyof T): number => {
  return items.reduce<number>((acc, item) => {
    const num = item[key]
    if (typeof num === 'string') {
      return acc + Number(item[key])
    } else if (typeof num === 'number') {
      return acc + num
    }
    throw Error('Attemped to sum non-numerical data')
  }, 0)
}

export const product = (items: string[] | number[]): number => {
  return items.reduce<number>((acc, item) => {
    if (typeof item === 'string') {
      return acc * Number(item)
    } else if (typeof item === 'number') {
      return acc * item
    }
    throw Error('Attemped to product non-numerical data')
  }, 1)
}

export const productObject = <T>(items: T[], key: keyof T): number => {
  return items.reduce<number>((acc, item) => {
    const num = item[key]
    if (typeof num === 'string') {
      return acc * Number(item[key])
    } else if (typeof num === 'number') {
      return acc * num
    }
    throw Error('Attemped to product non-numerical data')
  }, 1)
}

export function assertExists<T> (val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(
      'Expected \'val\' to be defined'
    )
  }
}

export const makeString = (content: string, length: number): string => {
  return [...Array(length).fill(content)].join('')
}

export const range = (number: number, offset = 0): number[] => {
  return [...Array(number).fill(0)].map((_, index) => {
    return index + offset
  })
}

const generateCacheKey = (args: any[]): string => {
  return args.reduce((cacheKey, arg) => (cacheKey += `_${typeof arg === 'object' ? JSON.stringify(args) : `${arg}`}_`), '')
}

export const memoise = <T extends (...args: any[]) => any>(func: T, alternateCacheKeyFunc?: (...args: Parameters<T>) => string): (...args: Parameters<T>) => ReturnType<T> => {
  const cache = new Map<string, ReturnType<T>>()

  return (...args: Parameters<T>) => {
    const cacheKey = alternateCacheKeyFunc ? alternateCacheKeyFunc(...args) : generateCacheKey(Array.from(args))
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) as ReturnType<T>
    }
    const result: ReturnType<T> = func(...args)
    cache.set(cacheKey, result)
    return result
  }
}

export const determinant = (arrOfArr: number[][]): number => {
  if (arrOfArr.length !== arrOfArr[0].length) {
    throw Error('Matrix not square')
  }
  switch (arrOfArr.length) {
    case 1: {
      // this isn't really a determinant
      return arrOfArr[0][0]
    }
    case 2: {
      const [a, b] = arrOfArr[0]
      const [c, d] = arrOfArr[1]
      return a * d - c * b
    }
    case 3: {
      const [a, b, c] = arrOfArr[0]
      const [d, e, f] = arrOfArr[1]
      const [g, h, i] = arrOfArr[2]
      return a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h
    }
    case 4:
    default:{
      throw Error('Too big :(')
    }
  }
}

export const keypress = async (): Promise<void> => {
  process.stdin.setRawMode(true)
  // eslint-disable-next-line @typescript-eslint/return-await
  return new Promise(resolve => process.stdin.once('data', () => {
    process.stdin.setRawMode(false)
    resolve()
  }))
}
