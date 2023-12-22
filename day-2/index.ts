import { readPuzzleInput } from '../common/utils'

interface Game {
  red: number
  green: number
  blue: number
}

interface ParsedLine {
  id: number
  games: Game[]
  max: Game
  power?: number
}

const MAX_CUBES = {
  red: 12,
  green: 13,
  blue: 14
}

const parseGame = (game: string): Game => {
  const initial: Game = {
    red: 0,
    blue: 0,
    green: 0
  }
  const rows = game.split(',').map(str => str.trim()).map((str) => {
    const [num, key] = str.split(' ')
    return {
      [key as keyof Game]: Number(num)
    }
  })
  return rows.reduce((acc, curr) => {
    return {
      ...acc,
      ...curr
    }
  }, initial)
}

const parseLine = (line: string): ParsedLine => {
  const [gameId, gamesString] = line.split(':')
  const id = Number(gameId.substring(4))
  const parsed: ParsedLine = {
    id,
    games: [],
    max: {
      red: 0,
      green: 0,
      blue: 0
    }
  }

  const games = gamesString.split(';').map(str => str.trim()).map(parseGame)

  parsed.games.push(...games)
  parsed.max = games.reduce((acc, curr) => {
    const temp = acc
    if (curr.red > temp.red) {
      temp.red = curr.red
    }
    if (curr.green > temp.green) {
      temp.green = curr.green
    }
    if (curr.blue > temp.blue) {
      temp.blue = curr.blue
    }
    return temp
  }, parsed.max)

  return parsed
}

const { lines } = readPuzzleInput({ small: false })

if (!lines) {
  throw Error('pop')
}

const parsedGameGroups = lines.map(parseLine)

const filteredGameGroups = parsedGameGroups.filter((gameGroup) => {
  if (gameGroup.max.red > MAX_CUBES.red) {
    return false
  }
  if (gameGroup.max.green > MAX_CUBES.green) {
    return false
  }
  if (gameGroup.max.blue > MAX_CUBES.blue) {
    return false
  }
  return true
})

console.log(filteredGameGroups)

const addedGameIds = filteredGameGroups.reduce((acc, curr) => {
  return acc + curr.id
}, 0)

console.log(`Part 1: ${addedGameIds}`)

const parsedWithPower = parsedGameGroups.map((gameGroup) => {
  const power = gameGroup.max.red * gameGroup.max.green * gameGroup.max.blue
  return {
    ...gameGroup,
    power
  }
})

const sumOfPowers = parsedWithPower.reduce((acc, curr) => {
  return acc + curr.power
}, 0)

console.log(`Part 2: ${sumOfPowers}`)
