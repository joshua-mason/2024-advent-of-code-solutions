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
  let stones = parse(data);
  const arr1 = [1, 2, [3, 4]];
  arr1.flat();
  for (let index = 0; index < 25; index++) {
    stones = blink(stones);
  }
  console.log(stones.length);
}

function parse(str: string) {
  return str.split(' ').map((n) => parseInt(n));
}

function blink(stones: number[]): number[] {
  const t = stones.map((stone) => transformStone(stone));
  return t.flat();
}

function transformStone(stone: number) {
  if (stone === 0) return 1;
  const stoneStr = String(stone);
  const len = stoneStr.length;
  if (stoneStr.length % 2 === 0) {
    return [
      parseInt(stoneStr.slice(0, len / 2)),
      parseInt(stoneStr.slice(len / 2)),
    ];
  }

  return stone * 2024;
}

run();
