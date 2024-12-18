import { randomInt } from 'crypto';
import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const testData2FilePath = __dirname + '/testData2.txt';
const testData3FilePath = __dirname + '/testData3.txt';
const dataFilePath = __dirname + '/data.txt';

enum Opcode {
  adv,
  bxl,
  bst,
  jnz,
  bxc,
  out,
  bdv,
  cdv,
}
type Operand = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type Bit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface Registers {
  A: number;
  B: number;
  C: number;
}

interface Instruction {
  opcode: Opcode;
  operand: Operand;
}

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const rawTestData2 = await loadData(testData2FilePath);
  const rawTestData3 = await loadData(testData3FilePath);
  const input = rawData;

  const { registers, program } = parseData(input);

  const out: number[] = runProgram(registers, program);
  console.log({ out, outJoin: out.join(',') });
}

part1();

function parseData(input: string): {
  registers: Registers;
  program: Bit[];
} {
  const [registersStr, programStr] = input.split('\n\n');

  const registers = registersStr.split('\n').reduce(
    (acc, s, idx) => {
      const value = parseInt(/\d+/.exec(s)?.[0]!!);
      const register = (['A', 'B', 'C'] as const)[idx];
      acc[register] = value;
      return acc;
    },
    {
      A: 0,
      B: 0,
      C: 0,
    } as Registers,
  );

  const program = programStr
    .split(' ')[1]
    .split(',')
    .map((n) => parseInt(n) as Bit);

  return {
    registers,
    program,
  };
}
function runProgram(registers: Registers, program: Bit[]): number[] {
  let instructionPointer = 0;
  const output: number[] = [];

  while (instructionPointer < program.length) {
    const opcode: Opcode = program[instructionPointer];
    const operand: Operand = program[instructionPointer + 1];
    const { pointer, out } = computeInstruction(
      instructionPointer,
      registers,
      opcode,
      operand,
    );
    instructionPointer = pointer;
    if (out !== undefined) output.push(out);
  }

  return output;
}
function computeInstruction(
  instructionPointer: number,
  registers: Registers,
  opcode: Opcode,
  operand: Operand,
): { pointer: number; out?: number } {
  let pointer = instructionPointer;
  let out: number | undefined = undefined;
  pointer += 2;
  switch (opcode) {
    case 0: {
      const comboOperand = resolveComboOperand(operand, registers);
      registers['A'] = Math.floor(registers['A'] / Math.pow(2, comboOperand));
      break;
    }
    case 1:
      registers['B'] = xor(registers['B'], operand);
      break;
    case 2: {
      const comboOperand = resolveComboOperand(operand, registers);
      registers['B'] = comboOperand % 8;
      break;
    }
    case 3:
      if (registers['A'] === 0) {
        break;
      }
      pointer = operand;
      break;
    case 4:
      registers.B = xor(registers.B, registers.C);
      break;

    case 5: {
      const comboOperand = resolveComboOperand(operand, registers);
      out = comboOperand % 8;
      break;
    }
    case 6: {
      const comboOperand = resolveComboOperand(operand, registers);
      registers['B'] = Math.floor(registers['A'] / Math.pow(2, comboOperand));
      break;
    }
    case 7: {
      const comboOperand = resolveComboOperand(operand, registers);
      registers['C'] = Math.floor(registers['A'] / Math.pow(2, comboOperand));
      break;
    }

    default:
      break;
  }

  return {
    out,
    pointer,
  };
}
function resolveComboOperand(operand: number, registers: Registers) {
  let operandValue = operand as number;
  if (operand > 3) {
    switch (operand) {
      case 4:
        operandValue = registers['A'];
        break;
      case 5:
        operandValue = registers['B'];
        break;

      case 6:
        operandValue = registers['C'];
        break;

      case 7:
        throw new Error('7 is reserved');
    }
  }
  return operandValue;
}

function xor(a: number, b: number): number {
  let binA = (a >>> 0).toString(2).padStart(4, '0');
  let binB = (b >>> 0).toString(2);
  const maxLength = Math.max(binA.length, binB.length);
  binA = binA.padStart(maxLength, '0');
  binB = binB.padStart(maxLength, '0');
  let output = '';
  for (let index = 0; index < binA.length; index++) {
    const i = binA[index];
    const j = binB[index];
    output += i === j ? '0' : '1';
  }
  const parsedBinaryOutput = parseInt(output, 2);
  return parsedBinaryOutput;
}
