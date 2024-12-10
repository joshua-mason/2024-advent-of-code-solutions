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
    const endingPointsForHikes: Coord[] = findRoutes(
      startingCoord,
      parsedCoords,
    );
    startingPoints.set(s, endingPointsForHikes);
  });
  console.log(
    Array.from(startingPoints.values()).reduce(
      (acc, arr) => acc + arr.length,
      0,
    ),
  );
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
function findRoutes(startingCoord: Coord, parsedCoords: number[][]): Coord[] {
  let map: number[][] = JSON.parse(JSON.stringify(parsedCoords));

  let currentSpot = startingCoord;
  let forcedRoute: Coord[] = [];
  let currentHeight = 0;
  const endpoints: Coord[] = [];

  function reset() {
    currentSpot = startingCoord;
    currentHeight = 0;
    forcedRoute = [];
  }
  let i = 0;
  let nextOptions = getNextOptions(startingCoord, map);
  // console.log('Start', { startingCoord, nextOptions });

  while (nextOptions) {
    nextOptions = getNextOptions(currentSpot, map);

    // console.log('Step:', currentHeight + 1, { currentSpot, nextOptions });
    if (!nextOptions) {
      map = removeRoute(map, forcedRoute);
      reset();
      nextOptions = getNextOptions(startingCoord, map);

      continue;
    }
    i++;
    if (nextOptions.length === 1) {
      let nextOption = nextOptions[0];
      forcedRoute.push(nextOption);
      currentSpot = nextOption;
    } else {
      let nextOption = nextOptions[0];
      forcedRoute = [nextOption];
      currentSpot = nextOption;
    }
    currentHeight += 1;
    if (currentHeight === 9) {
      console.log('Found route', {
        forcedRoute,
        currentSpot,
        currentHeight,
      });
      map = removeRoute(map, forcedRoute);
      endpoints.push(currentSpot);
      reset();
    }
    if (i > 100) {
      console.log('probably infinite loop');
      break;
    }
  }

  return endpoints;
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

function removeRoute(map: number[][], forcedRoute: Coord[]): number[][] {
  for (const step of forcedRoute) {
    map[step.y][step.x] = 0;
  }
  return map;
}
