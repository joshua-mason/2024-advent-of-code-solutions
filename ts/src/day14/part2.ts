import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

interface Position {
  x: number;
  y: number;
}

interface Move {
  x: number;
  y: number;
}

interface Robot {
  position: Position;
  movement: Move;
}

interface Room {
  width: number;
  height: number;
}

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;
  const robots: Robot[] = parseInput(input);
  const room: Room = {
    height: 103,
    width: 101,
  };
  let diff = 0;
  let lastAvs = 0;
  for (let index = 0; index < 10000; index++) {
    const positions: Position[] = simulateMovement(robots, room, index);
    const avs = averagePositions(positions, room);
    diff = lastAvs - avs;
    lastAvs = avs;
    if (diff > 3) {
      console.log(index, avs);
      drawRobots(positions, room);
    }
  }
}

part1();

function parseInput(input: string): Robot[] {
  return input.split('\n').map((robotStr, idx) => {
    const regex = /-?[0-9]+/g;
    const pxStr = regex.exec(robotStr)?.[0]!;
    const pyStr = regex.exec(robotStr)?.[0]!;
    const vxStr = regex.exec(robotStr)?.[0]!;
    const vyStr = regex.exec(robotStr)?.[0]!;
    return {
      movement: {
        x: parseInt(vxStr),
        y: parseInt(vyStr),
      },
      position: {
        x: parseInt(pxStr),
        y: parseInt(pyStr),
      },
    };
  });
}

function simulateMovement(
  robots: Robot[],
  room: Room,
  seconds: number,
): Position[] {
  return robots.map((robot) => ({
    x:
      (robot.position.x + robot.movement.x * seconds + room.width * seconds) %
      room.width,
    y:
      (robot.position.y + robot.movement.y * seconds + room.height * seconds) %
      room.height,
  }));
}

function drawRobots(positions: Position[], room: Room) {
  let roomGrid: string[][] = new Array(room.height).map(() =>
    new Array(room.width).fill('.'),
  );
  roomGrid = roomGrid.map((row) => [...row]);

  roomGrid = [];
  for (let index = 0; index < room.height; index++) {
    roomGrid.push(new Array(room.width).fill('.'));
  }

  for (const position of positions) {
    roomGrid[position.y][position.x] = 'X';
  }
  console.log(roomGrid.map((arr) => arr.join('')).join('\n'));
}

function averagePositions(positions: Position[], room: Room): number {
  let avX = positions.reduce((acc, p) => acc + p.x, 0) / positions.length;
  let avY = positions.reduce((acc, p) => acc + p.y, 0) / positions.length;

  let stdX = Math.pow(
    positions.reduce((acc, p) => acc + Math.pow(p.x - avX, 2), 0) /
      positions.length,
    0.5,
  );
  let stdY = Math.pow(
    positions.reduce((acc, p) => acc + Math.pow(p.y - avY, 2), 0) /
      positions.length,
    0.5,
  );
  return stdX;
}
