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

function checkEquation(
  { equationSequence, value }: { value: number; equationSequence: number[] },
  // index: number,
  // array: { value: number; equationSequence: number[] }[],
): boolean {
  /*
  This is a tricky one... brute force, we can iterate through all permutations
  of the equation and stop if we get a match (and end early if we go "value").
  I wonder if we could start with the larger values first to speed this up, but unsure
  if it would affect the results... 

  
  */

  const operatorSequences = generateOperatorCombinations(
    equationSequence.length - 1,
  );

  for (const operatorSequence of operatorSequences) {
    const equalsValue: boolean = checkOperatorSequence(
      equationSequence,
      operatorSequence,
      value,
    );
    // console.log({ equalsValue });
    if (equalsValue) return true;
  }

  return false;
}

enum Operator {
  Add,
  Multiply,
}

// 2 => 2
// 3 => 4
// 4 => 8 (+ + +, + + *, + * +, * + +, + * +, + * *, * * +, * * * ) where "+ * +" is counted twice
// P(n,r)=n! (n−r)!
// function makePermutations(length: number): Operator[][] {
//   const perms = [];
//   const totalPermutations = length ** 2;

//   for (let permutationN = 0; permutationN < totalPermutations; permutationN++) {
//     let permutation: Operator[] = [];

//     for (let operatorN = 0; operatorN < length; operatorN++) {
//       // permutation = makePermutation(operatorN, permutationN, length);
//       // const mod = operatorN % permutationN;
//       // const fit = Math.floor(permutationN / operatorN);
//       // console.log({
//       //   index: operatorN,
//       //   permutationNumber: permutationN,
//       //   fit,
//       //   mod,
//       // });
//       // if (mod) permutation.push(Operator.Add);
//       // else permutation.push(Operator.Multiply);
//     }
//     console.log(`Adding permutation ${permutation}`);
//     perms.push(permutation);
//   }
//   return perms;
// }

// function makePermutation(
//   operatorN: number,
//   permutationN: number,
//   length: number,
// ): Operator[] {
//   const permutationI = Math.floor(permutationN / length);
//   const permutationNModL = permutationN % length;
//   console.log({
//     operatorN,
//     permutationNModL: permutationNModL,
//     permutationI: permutationI,
//     total: permutationNModL + operatorN + permutationI,
//   });
//   const N_OPERATORS = 2;
//   let permutation: Operator[] = [];
//   for (let i = 0; i < length; i++) {
//     const operatorToAdd =
//       (operatorN + permutationN + i) % N_OPERATORS
//         ? Operator.Add
//         : Operator.Multiply;
//     permutation.push(operatorToAdd);
//   }
//   return permutation;
// }

// function perm(
//   length: number,
//   p: number,
//   i: number = 0,
//   o?: number[][],
// ): number[][] {
//   const totalL = length ** p;
//   if (o && o.length === totalL) return o;
//   if (!o) {
//     o = [new Array(length).fill(0)];
//     return perm(length, p, 1, o);
//   }
//   const next = new Array(length).fill(0);
//   console.log('next');
//   for (let position = 0; position < length; position++) {
//     // modify i and i % length?
//     // next[i] = 1;
//     console.log({ i, iModL: i % length, position: position });
//     next[i % length] = 1;
//   }
//   o.push(next);
//   return perm(length, p, i + 1, o);

//   // for (let index = 0; index < totalL; index++) {

//   // }
// }

// console.log(perm(2, 2));

// iteration 0,
//   position 0 = 0
//   position 1 = 0
// iteration 1,
//   position 0 = 1 ()
//   position 1 = 0
// iteration 2,
//   position 0 = 0
//   position 1 = 1
// iteration 3,
//   position 0 = 1
//   position 1 = 1

function generateOperatorCombinations(length: number) {
  const operators: Operator[][] = [];
  const twoToPowerOfLength = 2 ** length;
  for (let index = 0; index < Math.max(twoToPowerOfLength, 2); index++) {
    // console.log(index);
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
  // console.log({
  //   equationSequence,
  //   operatorSequence,
  // });

  const calculatedValue = equationSequence.reduce((acc, el, idx) => {
    if (idx === 0) return el;
    const operator = operatorSequence.at(idx - 1);
    if (operator === undefined)
      throw new Error(`No operator found at index ${idx - 1}`);
    return operator === Operator.Add ? acc + el : acc * el;
  }, 0);

  // console.log({ calculatedValue });
  return calculatedValue === value;

  let runningTotal = 0;
  for (let index = 0; index < equationSequence.length; index++) {
    const element = equationSequence[index];

    if (index === 0) runningTotal += element;
    const operator = operatorSequence[index - 1];
    console.log({
      operator,
      element,
      runningTotal,
    });
    if (operator === Operator.Add) {
      runningTotal += element;
    } else {
      runningTotal *= element;
    }
    if (runningTotal > value) return false;
  }

  return runningTotal === value;
}

// console.log('generateOperatorCombinations(1)', generateOperatorCombinations(1));
// console.log('generateOperatorCombinations(2)', generateOperatorCombinations(2));
// console.log('generateOperatorCombinations(3)', generateOperatorCombinations(3));
// console.log('generateOperatorCombinations(4)', generateOperatorCombinations(4));
// console.log('generateOperatorCombinations(5)', generateOperatorCombinations(5));
