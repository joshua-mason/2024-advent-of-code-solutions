import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const testData2FilePath = __dirname + '/testData2.txt';
const dataFilePath = __dirname + '/data.txt';

enum TileType {
  Box = 'box',
  Empty = 'emoty',
  Wall = 'wall',
  Robot = 'robot',
}

interface Tile {
  x: number;
  y: number;
  tile: TileType;
}

type Factory = Tile[][];

enum Move {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

const VEC_MAP: { [key: string]: { x: number; y: number } } = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const rawTestData2 = await loadData(testData2FilePath);
  const input = rawData;

  const { factory, moves } = parseData(input);

  const factoryEndState: Factory = simulate(factory, moves);

  const sumOfGPSCoords = sumGPSCoords(factoryEndState);
  console.log({ sumOfGPSCoords });
}

part1();

function sumGPSCoords(factory: Factory) {
  return factory.reduce((acc, row, rowIdx) => {
    const rowScore = row.reduce((acc, tile, colIdx) => {
      if (tile.tile !== TileType.Box) return acc;
      return acc + tile.y * 100 + tile.x;
    }, 0);
    return acc + rowScore;
  }, 0);
}

function parseData(input: string): { factory: Factory; moves: Move[] } {
  const [mapStr, moveStr] = input.split('\n\n');

  const moves: Move[] = moveStr
    .split('')
    .filter((char) => '<>^v'.includes(char))
    .map((char) => {
      switch (char) {
        case '>':
          return Move.Right;
        case '<':
          return Move.Left;
        case '^':
          return Move.Up;
        case 'v':
          return Move.Down;
        default:
          throw new Error(`Unable to parse char: ${char}`);
      }
    });

  const factory: Tile[][] = mapStr.split('\n').map((row, rowIdx) => {
    return row.split('').map((char, colIdx) => {
      let tile: TileType;
      switch (char) {
        case '#':
          tile = TileType.Wall;
          break;

        case '.':
          tile = TileType.Empty;
          break;

        case '@':
          tile = TileType.Robot;
          break;

        case 'O':
          tile = TileType.Box;
          break;

        default:
          throw new Error(`Unknown tile ${char}`);
      }
      return {
        x: colIdx,
        y: rowIdx,
        tile,
      };
    });
  });

  return {
    moves,
    factory,
  };
}

function printMap(factory: Factory) {
  let mapStr = factory
    .map((row) =>
      row
        .map((tile) => {
          switch (tile.tile) {
            case TileType.Box:
              return 'O';
            case TileType.Robot:
              return '@';
            case TileType.Empty:
              return '.';
            case TileType.Wall:
              return '#';
            default:
              throw Error(`Unknown TileType: ${tile}`);
          }
        })
        .join(''),
    )
    .join('\n');
  console.log(mapStr);
}

function simulate(factory: Factory, moves: Move[], steps?: number): Factory {
  let mutFactory: Factory = JSON.parse(JSON.stringify(factory));
  for (let index = 0; index < moves.length; index++) {
    if (steps === index) break;
    const move = moves[index];
    console.log(`\nApply move ${index}: ${move}`);
    mutFactory = applyMove(mutFactory, move);
    printMap(mutFactory);
  }
  return mutFactory;
}

function applyMove(mutFactory: Factory, move: Move): Factory {
  let directionVec: {
    x: number;
    y: number;
  } = VEC_MAP[move];

  const tilesInFront: Tile[] = getTilesInFront(mutFactory, move);
  if (!tilesInFront.map((tile) => tile.tile).includes(TileType.Empty)) {
    return mutFactory;
  }

  if (tilesInFront[0].tile === TileType.Empty) {
    // simple operation to move Robot one space
    const robotTile = findRobotTile(mutFactory);
    updateFactoryTile(mutFactory, robotTile, TileType.Empty);
    updateFactoryTile(mutFactory, tilesInFront[0], TileType.Robot);
  }

  if (tilesInFront[0].tile === TileType.Box) {
    // check how many boxes and then move them in the map
    const robotTile = findRobotTile(mutFactory);
    updateFactoryTile(mutFactory, robotTile, TileType.Empty);
    updateFactoryTile(mutFactory, tilesInFront[0], TileType.Robot);
    for (const tile of tilesInFront) {
      if (tile.tile !== TileType.Box) {
        if (tile.tile !== TileType.Empty) throw new Error('Unable to move');
        break;
      }
      updateFactoryTile(
        mutFactory,
        {
          x: tile.x + directionVec.x,
          y: tile.y + directionVec.y,
          tile: tile.tile,
        },
        TileType.Box,
      );
    }
  }

  return mutFactory;
}

function updateFactoryTile(
  mutFactory: Factory,
  tileToReplace: Tile,
  replacement: TileType,
) {
  mutFactory[tileToReplace.y][tileToReplace.x] = {
    tile: replacement,
    x: tileToReplace.x,
    y: tileToReplace.y,
  };
}

function getTilesInFront(mutFactory: Factory, move: Move): Tile[] {
  let directionVec: {
    x: number;
    y: number;
  } = VEC_MAP[move];
  const robotTile = findRobotTile(mutFactory);
  let currentTile: Tile | undefined = robotTile;
  const tiles: Tile[] = [];
  while (currentTile) {
    const updatedYPosition: number = currentTile.y + directionVec.y;
    const updatedXPosition: number = currentTile.x + directionVec.x;
    if (updatedYPosition < 0 || updatedXPosition < 0) break;
    if (currentTile.tile === TileType.Wall) break;
    currentTile = mutFactory.at(updatedYPosition)?.at(updatedXPosition);
    if (currentTile) tiles.push(JSON.parse(JSON.stringify(currentTile)));
  }
  return tiles;
}

function findRobotTile(mutFactory: Factory) {
  const robotTile = mutFactory
    .find((row) => row.find((tile) => tile.tile === TileType.Robot))
    ?.flatMap((t) => t)
    ?.filter((t) => t.tile === TileType.Robot);
  if (!robotTile) throw Error('Unable to locate robot');
  return robotTile[0];
}
