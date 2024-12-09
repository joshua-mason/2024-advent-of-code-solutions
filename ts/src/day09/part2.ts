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
  id: number;
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

  const parsedResources: (FreeMemory | OccupiedMemory)[] = parseMemory(input);

  const compactedResources: (FreeMemory | OccupiedMemory)[] = compactResources(
    JSON.parse(JSON.stringify(parsedResources)),
  );

  const compactedOwnedMemory = buildMemoryOwnership(compactedResources);
  const checksum: number = calculateChecksum(compactedOwnedMemory);
  console.log({ checksum });
}

part1();

function printMemory(parsedResources: (FreeMemory | OccupiedMemory)[]) {
  const compactedOwnedMemoryOrig = buildMemoryOwnership(
    JSON.parse(JSON.stringify(parsedResources)),
  );
  console.log(
    compactedOwnedMemoryOrig.map((m) => (m.owned ? m.ownerId : '.')).join(''),
  );
}

function compactResources(resources: (FreeMemory | OccupiedMemory)[]) {
  let updatedResources = JSON.parse(JSON.stringify(resources));
  const resourcesToMove = resources
    .reverse()
    .filter((r) => r.type === 'occupied');

  for (const resource of resourcesToMove) {
    updatedResources = tryMove(updatedResources, resource);
  }

  return updatedResources;
}

function tryMove(
  resources: (FreeMemory | OccupiedMemory)[],
  resource: OccupiedMemory,
) {
  const relevantFreeResourceIdx = resources.findIndex(
    (r) => r.type === 'free' && r.size >= resource.size,
  );

  const resourceIdx = resources.findIndex(
    (r) => r.type === 'occupied' && r.index === resource.index,
  );
  if (relevantFreeResourceIdx === -1 || relevantFreeResourceIdx > resourceIdx)
    return resources;

  // reduce size of the memory being used up
  const memoryBeingFreed = resources[relevantFreeResourceIdx];
  resources[relevantFreeResourceIdx] = {
    ...memoryBeingFreed,
    size: memoryBeingFreed.size - resource.size,
  };

  // free up original resource memory
  resources[resourceIdx] = {
    type: 'free',
    index: resourceIdx,
    size: resource.size,
  };

  resources = resources
    .slice(0, relevantFreeResourceIdx)
    .concat([resource])
    .concat(resources.slice(relevantFreeResourceIdx));
  return resources;
}

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
        id: Math.floor(idx / 2),
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

function calculateChecksum(
  compactedOwnedMemory: (OwnedMemoryBit | FreeMemoryBit)[],
): number {
  return compactedOwnedMemory.reduce((acc, v, i) => {
    if (!v.owned) return acc;
    return acc + v.ownerId * i;
  }, 0);
}
