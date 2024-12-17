import { randomInt } from 'crypto';
import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const testData2FilePath = __dirname + '/testData2.txt';
const dataFilePath = __dirname + '/data.txt';

enum TileType {
  // Box = 'box',
  Empty = 'empty',
  Wall = 'wall',
  Reindeer = 'reindeer',
  SteppedOn = 'stepped-on',
  End = 'end',
}

interface Tile {
  x: number;
  y: number;
  tile: TileType;
}

type Maze = Tile[][];

enum Move {
  Right,
  Down,
  Left,
  Up,
}

const VEC_MAP: { [key: number]: { x: number; y: number } } = {
  0: { x: 1, y: 0 },
  1: { x: 0, y: 1 },
  2: { x: -1, y: 0 },
  3: { x: 0, y: -1 },
};

let counters: number[][];
let reindeerTile: Tile;
let reindeerStartTile: Tile;

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const rawTestData2 = await loadData(testData2FilePath);
  const input = rawData;

  const { maze: maze } = parseData(input);

  counters = new Array(maze.length)
    .fill(0)
    .map((_) => getRangeBetween(0, maze[0].length).map((a) => 0));
  // console.log({ counters });
  reindeerStartTile = JSON.parse(JSON.stringify(findReindeerTile(maze)));
  const games: {
    maze: Maze;
    score: number;
    completed: boolean;
  }[] = [];

  fillAllDeadEnds(maze);

  const simulations = 100000;
  for (let seed = 0; seed < simulations; seed++) {
    const game = simulate(maze, seed);
    // printMap(game.maze);
    // cleanup:
    updateMazeTile(maze, reindeerTile, TileType.Empty);
    updateMazeTile(maze, reindeerStartTile, TileType.Reindeer);
    maze.map((row) =>
      row.map((tile) => {
        if (tile.tile === TileType.SteppedOn) tile.tile = TileType.Empty;
      }),
    );
    games.push(game);
  }
  games.sort((a, b) => a.score - b.score);
  console.log(games.map((g) => g.score));
  const groupedMazes = games
    // .slice(100, 110)
    .reduce(
      (acc, game) => {
        if (acc[game.score])
          acc[game.score] = {
            game: acc[game.score].game,
            count: acc[game.score].count + 1,
          };
        else
          acc[game.score] = {
            game: game,
            count: 1,
          };
        return acc;
      },
      {} as {
        [i: number]: {
          count: number;
          game: {
            maze: Maze;
            score: number;
            completed: boolean;
          };
        };
      },
    );
  // console.log(groupedMazes);
  Object.entries(groupedMazes).forEach(([score, data]) => {
    // if (parseInt(score) < 7000 || parseInt(score) >= 8000) return;
    console.log(
      `score ${score} (${100 * (data.count / simulations)}) ${data.game.completed}`,
    );
    // printMap(data.game.maze);
  });
  console.log(new Set(games.filter((g) => g.completed).map((g) => g.score)));
  // printMap(games[-1].maze);
  // const sumOfGPSCoords = sumGPSCoords(mazeEndState);
  // console.log({ sumOfGPSCoords });
}

part1();

function parseData(input: string): { maze: Maze } {
  const maze: Tile[][] = input.split('\n').map((row, rowIdx) => {
    return row.split('').map((char, colIdx) => {
      let tile: TileType;
      switch (char) {
        case '#':
          tile = TileType.Wall;
          break;

        case '.':
          tile = TileType.Empty;
          break;

        case ',':
          tile = TileType.SteppedOn;
          break;

        case 'S':
          tile = TileType.Reindeer;
          break;

        case 'E':
          tile = TileType.End;
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
    maze: maze,
  };
}

function printMap(maze: Maze) {
  let mapStr = maze
    .map((row) =>
      row
        .map((tile) => {
          switch (tile.tile) {
            case TileType.Reindeer:
              return '@';
            case TileType.Empty:
              return '.';
            case TileType.Wall:
              return '#';
            case TileType.SteppedOn:
              return ',';

            case TileType.End:
              return 'E';
            default:
              throw Error(`Unknown TileType: ${tile}`);
          }
        })
        .join(''),
    )
    .join('\n');
  console.log(mapStr);
}

function simulate(
  maze: Maze,
  seed: number,
): { maze: Maze; score: number; completed: boolean } {
  // const moves = generateMoves(seed);
  // console.log(`Simulation ${seed}`);

  reindeerTile = reindeerStartTile;
  // let mutMaze: Maze = JSON.parse(JSON.stringify(maze));
  let score = 0;
  let completed = false;
  let direction = Move.Right;
  for (let index = 0; index < 10000; index++) {
    // if (steps === index) break;
    counters[reindeerTile.y][reindeerTile.x]++;
    const move = getNextMove(maze, direction);
    // console.log(1, { move });
    if (move === null) break;
    // console.log({ move });
    if (move !== direction) {
      score += 1001;
    } else {
      score += 1;
    }

    // if (score > maxScore) break;
    // if (score === 7036) {
    //   console.log(move);
    //   printMap(maze);
    //   console.log('before');
    // }
    // console.log(`\nApply move ${index}: ${move}`);
    // console.log({ move });

    const moved = applyMove(maze, move);
    // console.log({ s: moved.stuck, c: moved.completed });
    // if (score === 7036) {
    //   console.log('after');

    //   console.log({ stuck: moved.stuck, completed: moved.completed });
    //   printMap(maze);
    // }
    direction = move;
    maze = moved.maze;
    // printMap(maze);
    if (moved.completed) {
      completed = moved.completed;
      break;
    }
    if (moved.stuck) {
      // console.log('stuck');
      // printMap(maze);
      // completed = moved.completed;
      break;
    }
    // printMap(maze);
  }

  return { maze: maze, score, completed };
}

function generateMoves(seed: number): Move[] {
  const steps = 100;
  let direction: Move = Move.Right;
  const moves: Move[] = [];
  for (let index = 0; index < steps; index++) {
    if (randomInt(5) === 0) {
      let direction: Move = randomInt(4) as Move;
      moves.push(direction);
      continue;
    }
    moves.push(direction);
  }
  return moves;
}

function applyMove(
  mutMaze: Maze,
  move: Move,
): { maze: Maze; completed: boolean; stuck: boolean } {
  // let directionVec: {
  //   x: number;
  //   y: number;
  // } = VEC_MAP[move];

  const tileInFront: Tile | undefined = getTileInFront(mutMaze, move);
  // if (!tilesInFront.map((tile) => tile.tile).includes(TileType.Empty)) {
  //   return { maze: mutMaze, completed: false, stuck: false };
  // }
  // console.log({ tileInFront });
  if (tileInFront?.tile === TileType.End) {
    // simple operation to move Reindeer one space
    // const reindeerTile = findReindeerTile(mutMaze);
    // updateMazeTile(mutMaze, reindeerTile, TileType.SteppedOn);
    // updateMazeTile(mutMaze, tileInFront, TileType.Reindeer);
    // reindeerTile = {
    //   ...tileInFront,
    //   tile: TileType.Reindeer,
    // };
    return { maze: mutMaze, completed: true, stuck: false };
  }

  if (tileInFront?.tile === TileType.Empty) {
    // simple operation to move Reindeer one space
    // const reindeerTile = findReindeerTile(mutMaze);
    updateMazeTile(mutMaze, reindeerTile, TileType.SteppedOn);
    updateMazeTile(mutMaze, tileInFront, TileType.Reindeer);
    reindeerTile = {
      x: tileInFront.x,
      y: tileInFront.y,
      tile: TileType.Reindeer,
    };
    // incrementStepCounter(tilesInFront);
  }

  // const stuck: boolean = checkStuck(mutMaze);

  return { maze: mutMaze, completed: false, stuck: !tileInFront };
}

function incrementStepCounter(tilesInFront: Tile[]) {
  counters[tilesInFront[0].y][tilesInFront[0].x] =
    counters[tilesInFront[0].y][tilesInFront[0].x] + 1;
}

function updateMazeTile(
  mutMaze: Maze,
  tileToReplace: Tile,
  replacement: TileType,
) {
  mutMaze[tileToReplace.y][tileToReplace.x] = {
    tile: replacement,
    x: tileToReplace.x,
    y: tileToReplace.y,
  };
}

function getTileInFront(
  mutMaze: Maze,
  move: Move,
  tile?: Tile,
): Tile | undefined {
  let directionVec: {
    x: number;
    y: number;
  } = VEC_MAP[move];

  const updatedYPosition: number = (tile || reindeerTile).y + directionVec.y;
  const updatedXPosition: number = (tile || reindeerTile).x + directionVec.x;
  return mutMaze.at(updatedYPosition)?.at(updatedXPosition);
  // // const reindeerTile = findReindeerTile(mutMaze);
  // let currentTile: Tile | undefined = reindeerTile;
  // const tiles: Tile[] = [];
  // while (currentTile) {
  //   const updatedYPosition: number = currentTile.y + directionVec.y;
  //   const updatedXPosition: number = currentTile.x + directionVec.x;
  //   if (updatedYPosition < 0 || updatedXPosition < 0) break;
  //   if (currentTile.tile === TileType.Wall) break;
  //   currentTile = mutMaze.at(updatedYPosition)?.at(updatedXPosition);
  //   if (currentTile) tiles.push(JSON.parse(JSON.stringify(currentTile)));
  //   // hack to just look one ahead for now
  //   break;
  // }
  // return tiles;
}

function findReindeerTile(mutMaze: Maze) {
  const reindeerTile = mutMaze
    .find((row) => row.find((tile) => tile.tile === TileType.Reindeer))
    ?.flatMap((t) => t)
    ?.filter((t) => t.tile === TileType.Reindeer);
  if (!reindeerTile) throw Error('Unable to locate reindeer');
  return reindeerTile[0];
}
function checkStuck(mutMaze: Maze): boolean {
  const tilesAround = getTilesAround(mutMaze);
  if (tilesAround.map((t) => t?.tile).includes(TileType.End)) return false;
  if (tilesAround.map((t) => t?.tile).includes(TileType.Empty)) return false;
  return true;
}

function getTilesAround(mutMaze: Maze, tile?: Tile) {
  return [Move.Right, Move.Down, Move.Left, Move.Up].map((vec) =>
    getTileInFront(mutMaze, vec, tile),
  );
}

function getNextMove(mutMaze: Maze, direction: Move): Move | null {
  const surroundingTiles = getTilesAround(mutMaze);

  const clockwiseMove = (direction + 4 + 1) % 4;
  const clockWiseTile = surroundingTiles[clockwiseMove];
  const anticlockwiseMove = (direction + 4 - 1) % 4;
  const anticlockWiseTile = surroundingTiles[anticlockwiseMove];
  const aheadTile = surroundingTiles[direction];

  // const anticlockWiseModifier =
  //   counters[anticlockWiseTile.y][anticlockWiseTile.x];
  // const clockWiseModifier = counters[clockWiseTile.y][clockWiseTile.x];
  // const aheadModifier = counters[aheadTile.y][aheadTile.x];

  // const r = randomInt(999);

  // let leftChance = getRangeBetween(0,5);
  // let rightChance = getRangeBetween(0,5);
  // if (aheadTile.tile !== TileType.Empty) {
  //   let leftChance = getRangeBetween(0,5);
  //   let rightChance = getRangeBetween(0,5);

  // // }
  // if (anticlockWiseTile.tile === TileType.Empty && r === 0)
  //   return anticlockwiseMove;
  // if (clockWiseTile.tile === TileType.Empty && r === 1) return clockwiseMove;

  // let totalChances = 9999;

  //

  if (!anticlockWiseTile || !clockWiseTile || !aheadTile)
    throw new Error('No tile');

  const options = [
    {
      tile: anticlockWiseTile,
      move: anticlockwiseMove,
      modifier: counters[anticlockWiseTile?.y][anticlockWiseTile?.x],
    },
    {
      tile: clockWiseTile,
      move: clockwiseMove,
      modifier: counters[clockWiseTile?.y][clockWiseTile?.x],
    },
    {
      tile: aheadTile,
      move: direction,
      modifier: counters[aheadTile?.y][aheadTile?.x],
    },
  ];

  const endTile = options.find((t) => t.tile?.tile === TileType.End);
  if (endTile) return endTile.move;
  const emptyOptions = options.filter((t) => t.tile?.tile === TileType.Empty);
  if (emptyOptions.length === 1) {
    return emptyOptions[0].move;
  }
  if (emptyOptions.length === 0) {
    // console.log({ options });
    return null;
  }
  emptyOptions.sort((a, b) => a.modifier - b.modifier);
  if (emptyOptions[0].modifier < emptyOptions[1].modifier) {
    // console.log(440, emptyOptions[0].modifier, emptyOptions[1].modifier);
    return emptyOptions[0].move;
  }

  const randomSelect = Math.floor(Math.random() * emptyOptions.length); //(emptyOptions.length);

  return emptyOptions[randomSelect].move;

  // const anticlockwiseChance = 9999 - anticlockWiseModifier;
  // const anticlockwiseRange = getRangeBetween(0, anticlockwiseChance);

  // const clockwiseChance = 9999 - clockWiseModifier;
  // const clockwiseRange = getRangeBetween(
  //   anticlockwiseChance,
  //   anticlockwiseChance + clockwiseChance,
  // );

  // const aheadChance = 9999 - aheadModifier;
  // const aheadRange = getRangeBetween(
  //   anticlockwiseChance,
  //   anticlockwiseChance + clockwiseChance + aheadChance,
  // );

  // const randomNumber = randomInt(
  //   anticlockwiseChance + clockwiseChance + aheadChance,
  // );

  // console.log({
  //   anticlockwiseMove,
  //   direction,
  //   clockwiseMove,
  //   randomNumber,
  //   anticlockwiseChance,
  //   clockwiseChance,
  //   anticlockWiseTile,
  //   clockWiseTile,
  //   aheadTile,
  // });

  // if (
  //   anticlockwiseRange.includes(randomNumber) &&
  //   anticlockWiseTile.tile === TileType.Empty
  // ) {
  //   return anticlockwiseMove;
  // }
  // if (
  //   clockwiseRange.includes(randomNumber) &&
  //   clockWiseTile.tile === TileType.Empty
  // ) {
  //   return clockwiseMove;
  // }
  // return direction;
}

function getRangeBetween(start: number, end: number) {
  const range = [];
  for (let index = start; index < end; index++) {
    range.push(index);
  }
  return range;
}
function fillAllDeadEnds(maze: Maze) {
  let deadEnds = fillDeadEnds(maze);
  while (deadEnds) {
    console.log(`filled ${deadEnds} dead ends`);
    deadEnds = fillDeadEnds(maze);
  }
}

function fillDeadEnds(maze: Maze): number {
  let filledDeadEnds = 0;

  for (const row of maze) {
    for (const tile of row) {
      if (tile.tile !== TileType.Empty) continue;
      const tilesAround = getTilesAround(maze, tile);
      if (tilesAround.filter((t) => t?.tile === TileType.Wall).length === 3) {
        tile.tile = TileType.Wall;
        filledDeadEnds++;
      }
    }
  }
  return filledDeadEnds;
}
