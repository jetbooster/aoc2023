import { readFileSync, statSync, writeFileSync } from 'fs'
import { isEqual, sum, uniq } from 'lodash'
import { assertExists, readPuzzleInput } from '../common/utils'

type Position = [number, number, number]

interface Block {
  name: string
  xStart: number
  yStart: number
  zStart: number
  xEnd: number
  yEnd: number
  zEnd: number
  supportedBy?: number[]
  supports?: number[]
  topEdge?: Position[]
  bottomEdge?: Position[]
}

type Blocks = Record<number, Block>

interface BlockStackPart {
  blocks: Blocks
  xMin: number | null
  xMax: number | null
  yMin: number | null
  yMax: number | null
  zMin: number | null
  zMax: number | null
}

interface BlockStack {
  blocks: Blocks
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  zMin: number
  zMax: number
}

const addTopAndBottom = (b: Block): Block => {
  const topEdge: Position[] = []
  const bottomEdge: Position[] = []
  for (let x = b.xStart; x <= b.xEnd; x++) {
    for (let y = b.yStart; y <= b.yEnd; y++) {
      topEdge.push([x, y, b.zEnd])
      bottomEdge.push([x, y, b.zStart])
    }
  }
  return {
    ...b,
    topEdge,
    bottomEdge
  }
}

const parse = (lines: string[]): BlockStack => {
  const r: Blocks = {}
  const bs: BlockStackPart = {
    blocks: r,
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
    zMin: null,
    zMax: null
  }
  lines.forEach((line, index) => {
    const result = line.match(/\d+/g)!
    const [xStart, yStart, zStart, xEnd, yEnd, zEnd] = result.map(Number)
    const block = {
      name: index.toString(),
      xStart: Math.min(xStart, xEnd),
      yStart: Math.min(yStart, yEnd),
      zStart: Math.min(zStart, zEnd),
      xEnd: Math.max(xStart, xEnd),
      yEnd: Math.max(yStart, yEnd),
      zEnd: Math.max(zStart, zEnd),
      supportedBy: []
    }
    r[index] = addTopAndBottom(block)
  })
  const maxAndMins = Object.values(bs.blocks).reduce<Record<string, number | null>>((acc, curr) => {
    acc.xMin = Math.min(acc.xMin ?? curr.xStart, curr.xStart)
    acc.xMax = Math.max(acc.xMax ?? curr.xEnd, curr.xEnd)
    acc.yMin = Math.min(acc.yMin ?? curr.yStart, curr.yStart)
    acc.yMax = Math.max(acc.yMax ?? curr.yEnd, curr.yEnd)
    acc.zMin = Math.min(acc.zMin ?? curr.zStart, curr.zStart)
    acc.zMax = Math.max(acc.zMax ?? curr.zEnd, curr.zEnd)
    return acc
  }, {
    xMin: null,
    xMax: null,
    yMin: null,
    yMax: null,
    zMin: null,
    zMax: null
  })
  return { ...bs, ...maxAndMins } as unknown as BlockStack
}

const canMove = (b: Block, bs: BlockStack): boolean => {
  if (b.zStart === 1) {
    return false
  }
  const blocksBelow = Object.values(bs.blocks).filter((bTest) => {
    return bTest.zEnd < b.zStart
  })
  if (blocksBelow.length === 0) {
    // no blocks below, definitely can move
    return true
  }
  let move = true
  blocksBelow.forEach((blockBelow) => {
    blockBelow.topEdge!.forEach((posTop) => {
      b.bottomEdge!.forEach((posBottom) => {
        if (isEqual([posTop[0], posTop[1], posTop[2] + 1], posBottom)) {
          move = false
        }
      })
    })
  })
  return move
}

const moveBlockOne = (b: Block): Block => {
  b.zEnd -= 1
  b.zStart -= 1
  b.topEdge = b.topEdge!.map((pos) => {
    return [pos[0], pos[1], pos[2] - 1]
  })
  b.bottomEdge = b.bottomEdge!.map((pos) => {
    return [pos[0], pos[1], pos[2] - 1]
  })
  return b
}

const moveUntilSettled = (r: BlockStack): void => {
  let cont = true
  const sortedBlocks = Object.values(r.blocks).sort((a, b) => a.zStart - b.zStart)
  let iterationCount = 0
  while (cont) {
    if (!(sortedBlocks.length % 10) && iterationCount === 0) {
      console.log(sortedBlocks.length)
    }
    if (sortedBlocks[0]) {
      if (canMove(sortedBlocks[0], r)) {
        const newBlock = moveBlockOne(sortedBlocks[0])
        r.blocks[Number(newBlock.name)] = newBlock
        iterationCount += 1
        continue
      } else {
        sortedBlocks.shift()
        iterationCount = 0
      }
    } else {
      cont = false
    }
  }
}

const calculateSupports = (bs: BlockStack): BlockStack => {
  const sortedBlocks = Object.values(bs.blocks).sort((a, b) => a.zStart - b.zStart)
  sortedBlocks.forEach((b) => {
    const blocksBelow = Object.values(bs.blocks).filter((bTest) => {
      return bTest.zEnd < b.zStart
    })
    blocksBelow.forEach((blockBelow) => {
      blockBelow.topEdge!.forEach((posTop) => {
        b.bottomEdge!.forEach((posBottom) => {
          if (isEqual([posTop[0], posTop[1], posTop[2] + 1], posBottom)) {
            if (!b.supportedBy) {
              b.supportedBy = []
            }
            b.supportedBy.push(Number(blockBelow.name))
          }
        })
      })
    })
    b.supportedBy = uniq(b.supportedBy)
    bs.blocks[Number(b.name)] = b
  })
  return bs
}

const calculateSupporting = (bs: BlockStack): BlockStack => {
  const sortedBlocks = Object.values(bs.blocks).sort((a, b) => a.zStart - b.zStart)
  sortedBlocks.forEach((b) => {
    b.supportedBy?.forEach((parent) => {
      if (!bs.blocks[Number(parent)].supports) {
        bs.blocks[Number(parent)].supports = []
      }
      bs.blocks[Number(parent)].supports?.push(Number(b.name))
    })
  })
  return bs
}

const calculateChainReaction = (b: Block, bs: BlockStack): number => {
  const blocksToCheck = b.supports ? b.supports : []
  const blocksToProcess: number[] = []
  blocksToCheck.forEach((block) => {
    if (bs.blocks[block].supportedBy && bs.blocks[block].supportedBy?.length === 1) {
      blocksToProcess.push(block)
    }
  })
  const fallingBlocks = new Set<number>([...blocksToProcess])
  while (blocksToProcess.length > 0) {
    const blockToProcessId = blocksToProcess.shift()!
    const blockToProcess = bs.blocks[blockToProcessId]
    if (blockToProcess.supports && blockToProcess.supports.length > 0) {
      blockToProcess.supports.forEach((potentiallyUnsupportedBlockId) => {
        const potentiallyUnsupportedBlock = bs.blocks[potentiallyUnsupportedBlockId]
        const allParentsFalling = potentiallyUnsupportedBlock.supportedBy?.every((parent) => {
          return fallingBlocks.has(parent)
        })
        if (allParentsFalling) {
          blocksToProcess.push(potentiallyUnsupportedBlockId)
          fallingBlocks.add(potentiallyUnsupportedBlockId)
        }
      })
    }
  }
  return fallingBlocks.size
}

const main = async (): Promise<void> => {
  const { lines } = await readPuzzleInput({ small: false })
  assertExists(lines)
  let bs: BlockStack
  try {
    statSync('./out.json')
    bs = JSON.parse(readFileSync('./out.json', 'utf-8'))
  } catch (e) {
    bs = parse(lines)
    console.log(bs)
    moveUntilSettled(bs)
    writeFileSync('./out.json', Buffer.from(JSON.stringify(bs)))
  }
  console.log(bs)
  bs = calculateSupports(bs)
  bs = calculateSupporting(bs)
  const allSupports = Object.values(bs.blocks).map((block) => {
    if (block.supportedBy) {
      return block.supportedBy
    } else {
      return []
    }
  })
  const allMultiSupports = allSupports.filter((support) => {
    return support.length > 1
  })
  // these are all the blocks that support a block, which also has _another_ support.
  const potentialRemovals = uniq(allMultiSupports.flat())
  // but, what if these have a different child which is only supported by it?
  const removals = potentialRemovals.filter((n: number) => {
    const isOnlyParent = allSupports.find((supports) => {
      if (supports.length === 1 && n === supports[0]) {
        return true
      }
      return false
    })
    return !isOnlyParent
  })

  console.log(removals.length + (lines.length - uniq(allSupports.flat()).length))
  const chainReactionLengths = Object.values(bs.blocks).map((block) => calculateChainReaction(block, bs))
  console.log(sum(chainReactionLengths))
}

void main()
