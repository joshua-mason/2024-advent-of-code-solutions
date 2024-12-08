import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

type AntennaMap = Map<string, [number, number][]>;
type AntiNodeMap = Map<string, number>;

async function part2() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawTestData;

  const width = input.split('\n')[0].length;
  const height = input.split('\n').length;

  const antennaMap: AntennaMap = buildAntennaMap(input);
  const antinodeMap: AntiNodeMap = buildAntinodeMap(antennaMap, width, height);

  console.log({ n: antinodeMap.size });
}

part2();

function buildAntennaMap(input: string): AntennaMap {
  const antennaMap = new Map<string, [number, number][]>();

  input.split('\n').map((row, rowIdx) =>
    row.split('').map((tile, colIdx) => {
      if (tile !== '.') {
        const current = antennaMap.get(tile);
        if (!current) antennaMap.set(tile, [[colIdx, rowIdx]]);
        else antennaMap.set(tile, current.concat([[colIdx, rowIdx]]));
      }
    }),
  );

  return antennaMap;
}

function buildAntinodeMap(
  antennaMap: AntennaMap,
  width: number,
  height: number,
): AntiNodeMap {
  const antinodeMap = new Map<string, number>();

  antennaMap.forEach((antennaPositions) => {
    const positions = findUniqueAntiNodePositions(
      antennaPositions,
      width,
      height,
    );
    for (const position of positions) {
      const key = position.join(',');
      const p = antinodeMap.get(key);
      if (p) {
        antinodeMap.set(key, p + 1);
      } else {
        antinodeMap.set(key, 1);
      }
    }
  });

  return antinodeMap;
}

function findUniqueAntiNodePositions(
  antennaPositions: [number, number][],
  width: number,
  height: number,
) {
  if (antennaPositions.length <= 1) return [];
  let antinodes: [number, number][] = [];
  for (const pos1 of antennaPositions) {
    for (const pos2 of antennaPositions) {
      if (pos1 === pos2) continue;
      const antinodePositions = calculateAntiNodePositions(
        pos1,
        pos2,
        width,
        height,
      );
      antinodes.push(...antinodePositions);
    }
  }
  return antinodes;
}

function calculateAntiNodePositions(
  pos1: [number, number],
  pos2: [number, number],
  width: number,
  height: number,
): [number, number][] {
  const difference: [number, number] = [pos1[0] - pos2[0], pos1[1] - pos2[1]];
  const antinodePositions = [];
  for (const antinodePos of generatePositions(
    pos1,
    difference,
    false,
    width,
    height,
  )) {
    antinodePositions.push(antinodePos);
  }
  for (const antinodePos of generatePositions(
    pos2,
    difference,
    true,
    width,
    height,
  )) {
    antinodePositions.push(antinodePos);
  }
  return antinodePositions;
}

function* generatePositions(
  startingPos: [number, number],
  diff: [number, number],
  reverse: boolean,
  width: number,
  height: number,
) {
  let current = startingPos;
  while (true) {
    const next: [number, number] = reverse
      ? [current[0] + diff[0], current[1] + diff[1]]
      : [current[0] - diff[0], current[1] - diff[1]];

    if (next[0] >= 0 && next[0] < width && next[1] >= 0 && next[1] < height) {
      yield next;
      current = next;
    } else {
      return;
    }
  }
}
