import { assertExists, readPuzzleInput, sum } from '../common/utils'

const hash = (string: string): number => {
  let i = 0
  string.split('').forEach((char: string) => {
    const charCode = char.charCodeAt(0)
    i += charCode
    i *= 17
    i = i % 256
  })
  return i
}

interface Lens {
  label: string
  box: number
  instruction: '-' | '='
  value?: number
}

const parse = (s: string): Lens => {
  if (s.includes('-')) {
    const label = s.replace('-', '')
    return {
      label,
      box: hash(label),
      instruction: '-'
    }
  } else {
    const [label, value] = s.split('=')
    return {
      label,
      box: hash(label),
      instruction: '=',
      value: Number(value)
    }
  }
}

const main = async (): Promise<void> => {
  const { lines } = await readPuzzleInput()
  assertExists(lines)
  // only one line today
  const lenses = lines[0].split(',').map(parse)
  const lensMap = new Map<number, Lens[]>()
  lenses.forEach((lens) => {
    if (!lensMap.has(lens.box)) {
      lensMap.set(lens.box, [])
    }
    const existingLensesInBox = lensMap.get(lens.box)!
    const lensIndex = existingLensesInBox?.findIndex((l) => l.label === lens.label)
    if (lens.instruction === '-') {
      if (lensIndex === -1) {
        return
      } else {
        existingLensesInBox.splice(lensIndex, 1)
      }
    }
    if (lens.instruction === '=') {
      if (lensIndex === -1) {
        existingLensesInBox.push(lens)
      } else {
        existingLensesInBox.splice(lensIndex, 1, lens)
      }
    }
    lensMap.set(lens.box, existingLensesInBox)
  })
  let totalFocusPower = 0
  lensMap.forEach((lensList) => {
    let i = 1
    const boxFocusPower = sum(lensList.map((lens) => {
      const lensFocusPower = i * lens.value! * (lens.box + 1)
      i += 1
      return lensFocusPower
    }))
    totalFocusPower += boxFocusPower
  })
  console.log(totalFocusPower)
}

void main()
