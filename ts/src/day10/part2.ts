import { randomInt } from 'crypto';
import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

interface Coord {
  x: number;
  y: number;
}

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;
  const parsedCoords: number[][] = parseCoords(input);
  let uniqueRoutes = 0;
  const startingPoints: Map<string, Coord[]> =
    buildStartingPointsMap(parsedCoords);
  Array.from(startingPoints.keys()).forEach((s) => {
    const startingVec = s.split(',').map((i) => parseInt(i)) as [
      number,
      number,
    ];
    const startingCoord = {
      x: startingVec[0],
      y: startingVec[1],
    };
    const endingPointsForHikes: Coord[][] = findRoutes(
      startingCoord,
      parsedCoords,
    );
    uniqueRoutes += endingPointsForHikes.length;
  });
  console.log(uniqueRoutes);
}

part1();

function parseCoords(input: string) {
  return input
    .split('\n')
    .map((row) => row.split('').map((tile) => parseInt(tile)));
}

function buildStartingPointsMap(
  parsedCoords: number[][],
): Map<string, Coord[]> {
  const hikeMap = new Map<string, Coord[]>();

  parsedCoords.forEach((row, rowIdx) =>
    row.forEach((tile, colIdx) => {
      if (tile === 0) hikeMap.set(`${colIdx},${rowIdx}`, []);
    }),
  );

  return hikeMap;
}
function findRoutes(startingCoord: Coord, parsedCoords: number[][]): Coord[][] {
  let map: number[][] = JSON.parse(JSON.stringify(parsedCoords));

  let currentSpot = startingCoord;
  let currentHeight = 0;

  let route: Coord[] = [startingCoord];
  function reset() {
    currentSpot = startingCoord;
    currentHeight = 0;
    route = [startingCoord];
  }
  let i = 0;
  let nextOptions = getNextOptions(startingCoord, map);
  const uniqueRoutes: Coord[][] = [];
  const foundRoutesSet = new Set();

  while (nextOptions) {
    nextOptions = getNextOptions(currentSpot, map);

    if (!nextOptions) {
      reset();
      nextOptions = getNextOptions(startingCoord, map);

      continue;
    }
    i++;
    if (nextOptions.length === 1) {
      let nextOption = nextOptions[0];
      currentSpot = nextOption;
    } else {
      let nextOption = nextOptions[0];
      currentSpot = nextOption;
    }

    currentSpot = randomOption(nextOptions);
    route.push(currentSpot);
    currentHeight += 1;
    if (currentHeight === 9) {
      const key = route.map((a) => `${a.x},${a.y}`).join('-');
      if (!foundRoutesSet.has(key)) {
        foundRoutesSet.add(key);
        uniqueRoutes.push(route);
      }
      reset();
    }
    if (i > 20000) {
      // MC iterations per starting point
      break;
    }
  }
  return uniqueRoutes;
}

function getNextOptions(
  currentPosition: Coord,
  map: number[][],
): Coord[] | undefined {
  const sameX = currentPosition.x;
  const sameY = currentPosition.y;
  const currentHeight = map[sameY][sameX];

  const pointAbove: Coord = {
    x: currentPosition.x,
    y: currentPosition.y - 1,
  };

  const pointBelow: Coord = {
    x: currentPosition.x,
    y: currentPosition.y + 1,
  };

  const pointLeft: Coord = {
    x: currentPosition.x - 1,
    y: currentPosition.y,
  };

  const pointRight: Coord = {
    x: currentPosition.x + 1,
    y: currentPosition.y,
  };

  const upSpot = getValueAtCoord(map, pointAbove);
  const downSpot = getValueAtCoord(map, pointBelow);
  const leftSpot = getValueAtCoord(map, pointLeft);
  const rightSpot = getValueAtCoord(map, pointRight);

  const options: Coord[] = [];
  if (upSpot === currentHeight + 1) {
    options.push(pointAbove);
  }
  if (downSpot === currentHeight + 1) {
    options.push(pointBelow);
  }
  if (leftSpot === currentHeight + 1) {
    options.push(pointLeft);
  }
  if (rightSpot === currentHeight + 1) {
    options.push(pointRight);
  }
  if (options.length === 0) return;
  return options;
}

function getValueAtCoord(map: number[][], coord: Coord) {
  if (coord.x < 0 || coord.x >= map[0].length) return undefined;
  if (coord.y < 0 || coord.y >= map.length) return undefined;

  return map.at(coord.y)?.at(coord.x);
}

function randomOption(nextOptions: Coord[]): Coord {
  return nextOptions[randomInt(nextOptions.length)];
}
