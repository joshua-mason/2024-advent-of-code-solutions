import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

type AntennaMap = Map<string, [number, number][]>;
type AntiNodeMap = Map<string, number>;

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;

  const width = input.split('\n')[0].length;
  const height = input.split('\n').length;

  const antennaMap: AntennaMap = parseMap(input);
  const antinodeMap: AntiNodeMap = makeAntinodeMap(antennaMap, width, height);

  console.log({ n: antinodeMap.size });
}

part1();

function parseMap(input: string): AntennaMap {
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
function makeAntinodeMap(
  antennaMap: AntennaMap,
  width: number,
  height: number,
): AntiNodeMap {
  const antinodeMap = new Map<string, number>();

  antennaMap.forEach((antennaPositions, antennaType) => {
    const positions = calculateAntinodePositions(antennaPositions);
    for (const pos of positions) {
      if (pos[0] >= 0 && pos[0] < width && pos[1] >= 0 && pos[1] < height) {
        const key = pos.join(',');
        const p = antinodeMap.get(key);
        if (p) {
          antinodeMap.set(key, p + 1);
        } else {
          antinodeMap.set(key, 1);
        }
      }
    }
  });

  return antinodeMap;
}

function calculateAntinodePositions(antennaPositions: [number, number][]) {
  if (antennaPositions.length <= 1) return [];
  const antinodes: [number, number][] = [];
  for (const pos1 of antennaPositions) {
    for (const pos2 of antennaPositions) {
      if (pos1 === pos2) continue;
      const difference: [number, number] = [
        pos1[0] - pos2[0],
        pos1[1] - pos2[1],
      ];
      const antinode1: [number, number] = [
        pos2[0] - difference[0],
        pos2[1] - difference[1],
      ];
      const antinode2: [number, number] = [
        pos1[0] + difference[0],
        pos1[1] + difference[1],
      ];
      antinodes.push(antinode1);
      antinodes.push(antinode2);
    }
  }
  return [...new Set(antinodes.map((v) => v.join(',')))].map((s) =>
    s.split(',').map((i) => parseInt(i)),
  ) as [number, number][];
}
