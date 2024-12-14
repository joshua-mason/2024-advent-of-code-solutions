import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

interface Button {
  x: number;
  y: number;
  price: number;
}

interface Prize {
  x: Number;
  y: number;
}

interface Machine {
  buttonA: Button;
  buttonB: Button;
  prize: Prize;
  id: number;
}

interface WinningCombination {
  aPresses: number;
  bPresses: number;
  cost: number;
}

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;
  const machines: Machine[] = parseInput(input);
  const winningCombinations: WinningCombination[] =
    calculateWinningCombos(machines);
  const value = winningCombinations.reduce((acc, combo) => {
    return acc + combo.cost;
  }, 0);
  console.log(value);
}

part1();

function calculateWinningCombos(machines: Machine[]): WinningCombination[] {
  const combos: WinningCombination[] = [];
  for (const machine of machines) {
    const combination: WinningCombination | false = tryMachine(machine);
    if (combination) combos.push(combination);
  }
  return combos;
  // throw new Error('Function not implemented.');
}

function parseInput(input: string): Machine[] {
  return input.split('\n\n').map((machineRulesStr, idx) => {
    const [buttonAStr, buttonBStr, prize] = machineRulesStr.split('\n');

    let regex = /[0-9]+/g;
    const axValueStr = regex.exec(buttonAStr)?.[0]!;
    const ayValueStr = regex.exec(buttonAStr)?.[0]!;
    regex = /[0-9]+/g;
    const bxValueStr = regex.exec(buttonBStr)?.[0]!;
    const byValueStr = regex.exec(buttonBStr)?.[0]!;

    regex = /[0-9]+/g;
    const prizeX = regex.exec(prize)?.[0]!;
    const prizeY = regex.exec(prize)?.[0]!;
    return {
      buttonA: {
        price: 3,
        x: parseInt(axValueStr),
        y: parseInt(ayValueStr),
      },
      buttonB: {
        price: 1,
        x: parseInt(bxValueStr),
        y: parseInt(byValueStr),
      },
      id: idx,
      prize: {
        x: parseInt(prizeX),
        y: parseInt(prizeY),
      },
    };
  });
}
function tryMachine(machine: Machine): WinningCombination | false {
  for (let aPresses = 0; aPresses < 100; aPresses++) {
    for (let bPresses = 0; bPresses < 100; bPresses++) {
      const combo:
        | { possible: false }
        | { possible: true; combination: WinningCombination } = checkPresses(
        aPresses,
        bPresses,
        machine,
      );
      if (combo.possible) return combo.combination;
    }
  }

  return false;
}
function checkPresses(
  aPresses: number,
  bPresses: number,
  machine: Machine,
): { possible: false } | { possible: true; combination: WinningCombination } {
  const xValue = machine.buttonA.x * aPresses + machine.buttonB.x * bPresses;
  const yValue = machine.buttonA.y * aPresses + machine.buttonB.y * bPresses;
  if (xValue === machine.prize.x && yValue === machine.prize.y)
    return {
      possible: true,
      combination: {
        aPresses,
        bPresses,
        cost:
          aPresses * machine.buttonA.price + bPresses * machine.buttonB.price,
      },
    };
  else
    return {
      possible: false,
    };
  // throw new Error('Function not implemented.');
}
