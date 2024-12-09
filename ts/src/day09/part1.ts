import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

interface FreeMemory {
  type: 'free';
  index: number;
  size: number;
}

interface OccupiedMemory {
  type: 'occupied';
  index: number;
  size: number;
}

interface OwnedMemoryBit {
  owned: true;
  ownerId: number;
}
interface FreeMemoryBit {
  owned: false;
  ownerId: undefined;
}

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;

  const parsedMemory: (FreeMemory | OccupiedMemory)[] = parseMemory(input);

  const ownedMemory = buildMemoryOwnership(parsedMemory);

  const compactedOwnedMemory = compactMemory(ownedMemory);

  const checksum: number = calculateChecksum(compactedOwnedMemory);
}

part1();

function parseMemory(memStr: string): (FreeMemory | OccupiedMemory)[] {
  return memStr.split('').map((digit, idx) => {
    if (idx % 2 === 1) {
      return {
        type: 'free',
        index: idx,
        size: parseInt(digit),
      };
    } else {
      return {
        type: 'occupied',
        index: idx,
        size: parseInt(digit),
      };
    }
  });
}

function buildMemoryOwnership(
  parsedMemory: (FreeMemory | OccupiedMemory)[],
): (OwnedMemoryBit | FreeMemoryBit)[] {
  const ownedMemoryRepr: (OwnedMemoryBit | FreeMemoryBit)[] = [];
  for (const memory of parsedMemory) {
    ownedMemoryRepr.push(
      ...Array(memory.size).fill({
        owned: memory.type === 'occupied',
        ownerId: memory.type === 'occupied' ? memory.index / 2 : undefined,
      }),
    );
  }
  return ownedMemoryRepr;
}

function compactMemory(
  ownedMemory: (OwnedMemoryBit | FreeMemoryBit)[],
): (OwnedMemoryBit | FreeMemoryBit)[] {
  const freeMemoryIndexes = ownedMemory
    .map((value, index) => ({
      owned: value.owned,
      index: index,
    }))
    .filter((value) => {
      if (!value.owned) return true;
    })
    .map((v) => v.index);

  for (const freeBit of freeMemoryIndexes) {
    const reverseOwnedMemIdx = ownedMemory.reverse().findIndex((b) => b.owned);
    const ownedMemIdx = ownedMemory.length - reverseOwnedMemIdx - 1;
    ownedMemory.reverse();
    const usedMem = ownedMemory[ownedMemIdx];
    if (!usedMem) {
      throw new Error('Memory not found');
    }
    if (freeBit > ownedMemIdx) break;
    ownedMemory[freeBit] = JSON.parse(JSON.stringify(usedMem));
    ownedMemory[ownedMemIdx] = { owned: false, ownerId: undefined };
  }
  return ownedMemory;
}

function calculateChecksum(
  compactedOwnedMemory: (OwnedMemoryBit | FreeMemoryBit)[],
): number {
  return compactedOwnedMemory.reduce((acc, v, i) => {
    if (!v.owned) return acc;
    return acc + v.ownerId * i;
  }, 0);
}
