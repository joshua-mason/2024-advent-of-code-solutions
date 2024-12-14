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
  const positions: Position[] = simulateMovement(robots, room, 100);
  drawRobots(positions, room);
  const safetyScore: number = calcSafetyScore(positions, room);
  console.log(safetyScore);
}

part1();

function parseInput(input: string): Robot[] {
  return input.split('\n').map((robotStr, idx) => {
    let regex = /-?[0-9]+/g;
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

function calcSafetyScore(positions: Position[], room: Room): number {
  interface RobotsQuadrants {
    topLeft: number;
    topRight: number;
    bottomLeft: number;
    bottomRight: number;
  }

  const robotsPositions: RobotsQuadrants = positions.reduce(
    (acc, position) => {
      const widthMidPoint = Math.floor(room.width / 2);
      const heightMidPoint = Math.floor(room.height / 2);
      if (position.x < widthMidPoint && position.y < heightMidPoint) {
        acc.topLeft = acc.topLeft + 1;
      }
      if (position.x > widthMidPoint && position.y < heightMidPoint) {
        acc.topRight = acc.topRight + 1;
      }
      if (position.x < widthMidPoint && position.y > heightMidPoint) {
        acc.bottomLeft = acc.bottomLeft + 1;
      }
      if (position.x > widthMidPoint && position.y > heightMidPoint) {
        acc.bottomRight = acc.bottomRight + 1;
      }
      return acc;
    },
    {
      topLeft: 0,
      topRight: 0,
      bottomLeft: 0,
      bottomRight: 0,
    } as RobotsQuadrants,
  );

  return (
    robotsPositions.bottomLeft *
    robotsPositions.bottomRight *
    robotsPositions.topLeft *
    robotsPositions.topRight
  );
}
function drawRobots(positions: Position[], room: Room) {
  // throw new Error('Function not implemented.');

  const arrs: string[][] = new Array(room.height).fill(
    new Array(room.width).fill('.'),
  );
  console.log(arrs.map((arr) => arr.join('')).join('\n'));

  for (const position of positions) {
    console.log(arrs[position.y][position.x]);
    arrs[position.y][position.x] = 'X';
  }

  console.log(arrs.map((arr) => arr.join('')).join('\n'));
}
