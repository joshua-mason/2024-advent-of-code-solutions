import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const input = rawData;

  const data: { value: number; equationSequence: number[] }[] =
    parseData(input);
  let i = 0;
  for (const equation of data) {
    const isMatch = checkEquation(equation);
    if (isMatch) i += equation.value;
  }
  console.log(i);
}

part1();

function parseData(
  input: string,
): { value: number; equationSequence: number[] }[] {
  return input.split('\n').map((line) => {
    const [valueStr, equationSequenceStr] = line.split(':');
    const value = parseInt(valueStr);
    const equationSequence = equationSequenceStr
      .trim()
      .split(' ')
      .map((number) => parseInt(number));
    return {
      value,
      equationSequence,
    };
  });
}

function checkEquation({
  equationSequence,
  value,
}: {
  value: number;
  equationSequence: number[];
}): boolean {
  const operatorSequences = generateOperatorCombinations(
    equationSequence.length - 1,
  );

  for (const operatorSequence of operatorSequences) {
    const equalsValue: boolean = checkOperatorSequence(
      equationSequence,
      operatorSequence,
      value,
    );
    if (equalsValue) return true;
  }

  return false;
}

enum Operator {
  Add,
  Multiply,
}

function generateOperatorCombinations(length: number) {
  const operators: Operator[][] = [];
  const twoToPowerOfLength = 2 ** length;
  for (let index = 0; index < Math.max(twoToPowerOfLength, 2); index++) {
    const o = index
      .toString(2)
      .padStart(length, '0')
      .split('')
      .map((n) => (n === '1' ? Operator.Multiply : Operator.Add));
    operators.push(o);
  }
  return operators;
}

function checkOperatorSequence(
  equationSequence: number[],
  operatorSequence: Operator[],
  value: number,
) {
  const calculatedValue = equationSequence.reduce((acc, el, idx) => {
    if (idx === 0) return el;
    const operator = operatorSequence.at(idx - 1);
    if (operator === undefined)
      throw new Error(`No operator found at index ${idx - 1}`);
    return operator === Operator.Add ? acc + el : acc * el;
  }, 0);

  return calculatedValue === value;
}
