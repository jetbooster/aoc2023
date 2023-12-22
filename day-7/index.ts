import lodash from 'lodash'
import { readPuzzleInput, sumObject } from '../common/utils'

const { lines } = readPuzzleInput({ small: false })

const cardValues = [
  'J',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'T',
  'Q',
  'K',
  'A'
]

const typeValue = [
  '1',
  '2',
  '2P',
  '3',
  'FH',
  '4',
  '5'
]

interface Hand {
  cards: string
  bid: number
  quality: '5' | '4' | 'FH' | '3' | '2P' | '2' | '1'
  winnings?: number
}

const jokerfy = (cards: string): Hand['quality'] => {
  const noJokerValues = cardValues.slice(1)
  const bestQuality = noJokerValues.reduce<Hand['quality'] >((acc, valToTest) => {
    const replaced = cards.replace(/J/g, valToTest)
    const handQuality = calculateQuality(replaced)

    if (!acc || typeValue.indexOf(handQuality) > typeValue.indexOf(acc)) {
      return handQuality
    }
    return acc
  }, '1')
  return bestQuality
}

const calculateQuality = (cards: string): Hand['quality'] => {
  const grouped = lodash.groupBy(cards.split(''))
  const numberOfGroups = Object.keys(grouped).length
  if (!cards.includes('J')) {
    // No jokers, continue as normal
    switch (numberOfGroups) {
      case 1:{
      // one group, all 5 cards are equal
        return '5'
      }
      case 2:{
      // can have 2 groups with 4-of-a-kind or FH
        if (Object.values(grouped).some((group) => group.length === 4)) {
          return '4'
        }
        return 'FH'
      }
      case 3:{
      // can have 3 groups with 3-of-a-kind or 2-pair
        if (Object.values(grouped).some((group) => group.length === 3)) {
          return '3'
        }
        return '2P'
      }
      case 4:{
      // can only have 4 groups with WWXYZ
        return '2'
      }
      case 5:{
      // 5 groups, all 5 cards are distinct
        return '1'
      }
      default:{
        throw Error(`couldn't parse ${cards}`)
      }
    }
  } else {
    return jokerfy(cards)
  }
}

const calculateBidValues = (hands: Hand[]): Hand[] => {
  const maxMultiplyer = hands.length
  return hands.map((hand, index) => {
    hand.winnings = (maxMultiplyer - index) * hand.bid
    return hand
  })
}

const compareHandTypes = (a: Hand['quality'], b: Hand['quality']): number => {
  if (typeValue.indexOf(a) > typeValue.indexOf(b)) {
    return -1
  }
  return 1
}

const compareHands = (a: Hand, b: Hand): number => {
  const compareInOrder = lodash.zip(a.cards.split(''), b.cards.split('')) as Array<[string, string]>

  for (let i = 0; i < compareInOrder.length; i++) {
    const [aCard, bCard] = compareInOrder[i]
    console.log(aCard, bCard)
    if (cardValues.indexOf(aCard) > cardValues.indexOf(bCard)) {
      console.log(aCard, bCard, 'A Bigger')
      return -1
    }
    if (cardValues.indexOf(aCard) < cardValues.indexOf(bCard)) {
      console.log(aCard, bCard, 'B Bigger')
      return 1
    }
    // otherwise compare next values
  }
  return 0
}

const parseLine = (line: string): Hand => {
  const [cards, bid] = line.split(' ')
  return {
    cards,
    bid: Number(bid),
    quality: calculateQuality(cards)
  }
}

const parsed = lines?.map(parseLine)

const groupedByType = lodash.groupBy(parsed, (hand) => {
  return hand.quality
})

const sortedWithinTypes = Object.entries(groupedByType).reduce<Partial<Record<Hand['quality'], Hand[]>>>((acc, [handType, hands]) => {
  acc[handType as Hand['quality']] = hands.sort(compareHands)
  return acc
}, {})

const sortedByTypes = Object.entries(sortedWithinTypes).sort((a, b) => compareHandTypes(a[0] as Hand['quality'], b[0] as Hand['quality'])).map(([handQual, hands]) => hands)

console.log(sortedByTypes)

const flattened = sortedByTypes.flat()

const winningsCalculated = calculateBidValues(flattened)

console.log(winningsCalculated)

console.log(`Part 1: ${sumObject(winningsCalculated, 'winnings')}`)
