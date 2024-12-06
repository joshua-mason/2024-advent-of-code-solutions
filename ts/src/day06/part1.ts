import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const testDataFilePath2 = __dirname + '/testData2.txt';
const dataFilePath = __dirname + '/data.txt';

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const rawTestData2 = await loadData(testDataFilePath2);
  const testDataToUse = rawData;
  const { labMap, startingGuardPosition } = buildLabMap(testDataToUse);
  const width = testDataToUse.split('\n')[0].length;
  const height = testDataToUse.split('\n').length;
  simulateGuardMovement({
    labMap,
    startingGuardPosition,
    width,
    height,
  });
  let totalDistinctSteps = 1; // including guard's starting position
  labMap.forEach(({ tile, stepCount }) => {
    if (stepCount > 0) totalDistinctSteps++;
  });
  console.log(totalDistinctSteps);
}

part1();

enum Tile {
  Empty,
  Obstruction,
}

function buildLabMap(data: string) {
  const labMap = new Map<string, { tile: Tile; stepCount: number }>();
  let startingGuardPosition: [number, number] = [0, 0];
  data.split('\n').map((row, rowIdx) => {
    row.split('').map((tile, colIdx) => {
      const coordinates = [colIdx, rowIdx] as const;
      if (tile === '^') startingGuardPosition = [...coordinates];
      if (tile === '#') {
        labMap.set(coordinates.join(','), {
          tile: Tile.Obstruction,
          stepCount: 0,
        });
      } else {
        labMap.set(coordinates.join(','), { tile: Tile.Empty, stepCount: 0 });
      }
    });
  });
  return { labMap, startingGuardPosition };
}
type Direction = 'up' | 'right' | 'down' | 'left';
function simulateGuardMovement({
  labMap,
  startingGuardPosition,
  width,
  height,
}: {
  labMap: Map<string, { tile: Tile; stepCount: number }>;
  startingGuardPosition: [number, number];
  width: number;
  height: number;
}) {
  const guardDirection: Direction = 'up';
  let moveDetails:
    | undefined
    | {
        guardDirection: Direction;
        guardPosition: [number, number];
      } = {
    guardPosition: startingGuardPosition,
    guardDirection,
  };
  while (
    (moveDetails = takeStep({
      guardPosition: moveDetails.guardPosition,
      guardDirection: moveDetails.guardDirection,
      labMap,
    }))
  ) {
    // printLabMap if you want to debug
  }
}

function takeStep({
  labMap,
  guardPosition,
  guardDirection,
}: {
  labMap: Map<string, { tile: Tile; stepCount: number }>;
  guardPosition: [number, number];
  guardDirection: Direction;
}) {
  const expectedNextTileCoords: [number, number] = getExpectedNextTile(
    guardDirection,
    guardPosition,
  );

  const key = expectedNextTileCoords.join(',');
  const expectedNextTile = labMap.get(key);
  if (expectedNextTile === undefined) return;

  if (expectedNextTile.tile === Tile.Empty) {
    labMap.set(key, {
      tile: expectedNextTile.tile,
      stepCount: expectedNextTile.stepCount + 1,
    });
    return { guardPosition: expectedNextTileCoords, guardDirection };
  } else {
    const newDirection: Direction = turn(guardDirection);

    return { guardPosition, guardDirection: newDirection };
  }
}

function getExpectedNextTile(
  guardDirection: Direction,
  guardPosition: [number, number],
) {
  let expectedNextTileCoords: [number, number];

  switch (guardDirection) {
    case 'up':
      expectedNextTileCoords = [guardPosition[0], guardPosition[1] - 1];
      break;
    case 'right':
      expectedNextTileCoords = [guardPosition[0] + 1, guardPosition[1]];
      break;
    case 'down':
      expectedNextTileCoords = [guardPosition[0], guardPosition[1] + 1];
      break;
    case 'left':
      expectedNextTileCoords = [guardPosition[0] - 1, guardPosition[1]];
      break;
  }
  return expectedNextTileCoords;
}

function turn(guardDirection: Direction) {
  let newDirection: Direction;
  switch (guardDirection) {
    case 'up':
      newDirection = 'right';
      break;
    case 'right':
      newDirection = 'down';
      break;
    case 'down':
      newDirection = 'left';
      break;
    case 'left':
      newDirection = 'up';
      break;
  }
  return newDirection;
}

function printLabMap(
  labMap: Map<string, { tile: Tile; stepCount: number }>,
  guardCoords: [number, number],
  w: number,
  h: number,
) {
  let mapStr = '';
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const key = [x, y].join(',');
      if (key === guardCoords.join(',')) {
        mapStr += 'G';
        continue;
      }
      const tileChar = labMap.get(key)?.tile === 0 ? '.' : '#';
      mapStr += tileChar;
    }
    mapStr += '\n';
  }
  console.log(mapStr);
}
