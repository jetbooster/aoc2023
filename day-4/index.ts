import { readPuzzleInput } from '../common/utils'

interface Card {
  id: number
  winningNumbers: string[]
  myNumbers: string[]
  part1Value: number
  scratchCardsWon: number
  count: number
}

const matchNumbers = (myNumbers: string[], winningNumbers: string[]): number => {
  let numberMatched = 0
  myNumbers.forEach((myNum) => {
    if (winningNumbers.includes(myNum)) {
      numberMatched += 1
    }
  })
  return numberMatched
}

const parseCard = (line: string): Card => {
  const [cardId, numbers] = line.split(':')
  const id = cardId.split(' ').filter(Boolean)[1]
  console.log(id)
  const [winningNumbers, myNumbers] = numbers.split('|')
  const winningNumbersArray = winningNumbers.trim().split(' ').filter(Boolean)
  const myNumbersArray = myNumbers.trim().split(' ').filter(Boolean)

  const numberMatched = matchNumbers(myNumbersArray, winningNumbersArray)
  return {
    id: Number(id) - 1,
    winningNumbers: winningNumbersArray,
    myNumbers: myNumbersArray,
    part1Value: numberMatched === 0 ? 0 : 2 ** (numberMatched - 1),
    scratchCardsWon: numberMatched,
    count: 1
  }
}

const { lines } = readPuzzleInput({ small: false })
if (!lines) {
  throw Error('pop')
}
const parsed = lines.map(parseCard)

const sum = parsed.reduce((acc, curr) => {
  return acc + curr.part1Value
}, 0)

console.log(`Part 1: ${sum}`)

let cardsOwned = 0
parsed.forEach((card, index) => {
  console.log(card)
  console.log(`This card wins ${card.scratchCardsWon}, and I have ${card.count} of them.`)
  if (card.scratchCardsWon > 0) {
    Array(card.scratchCardsWon).fill(0).forEach((_, index) => {
      const idToModify = card.id + index + 1
      console.log(`Adding ${card.count} to Card ${idToModify}. Before I had ${parsed[idToModify].count} of that card`)
      parsed[idToModify].count += card.count
    })
  }
  cardsOwned += card.count
})

console.log(`Part 2: ${cardsOwned}`)
