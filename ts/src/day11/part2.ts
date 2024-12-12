import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;
  run();
}

part1();

function run() {
  const data = '475449 2599064 213 0 2 65 5755 51149';

  let allStones = parse(data);
  let stoneIdx = 0;
  let stoneTally = new Map<string, number>();
  for (const stone of allStones) {
    stoneTally.set(stone, 1);
  }
  for (let index = 0; index < 25; index++) {
    const label = `blink ${index.toString().padStart(2)} (stone ${stoneIdx.toString().padStart(2)}, current length = ${stoneTally.size.toString().padStart(16)})`;
    console.time(label);
    stoneTally = blink(stoneTally);
    console.timeEnd(label);
  }
  stoneIdx++;

  console.log(
    [...stoneTally.entries()].reduce((acc, c) => {
      return acc + c[1];
    }, 0),
  );
}

function parse(str: string) {
  return str.split(' ').map((n) => n);
}

function blink(stoneTally: Map<string, number>): Map<string, number> {
  const newStoneTally = new Map<string, number>();
  for (const [stone, n] of stoneTally.entries()) {
    const newStones = transformStone(stone);
    newStones.forEach((s) => {
      s = parseInt(s).toString();
      const currentTally = newStoneTally.get(s) || 0;
      newStoneTally.set(s, n + currentTally);
    });
  }
  return newStoneTally;
}

function transformStone(stone: string) {
  if (stone === '0') return ['1'];
  if (stone.length % 2 === 0) {
    return [stone.slice(0, stone.length / 2), stone.slice(stone.length / 2)];
  }
  if (stone === '1') return ['2024'];
  return [String(parseInt(stone) * 2024)];
}
