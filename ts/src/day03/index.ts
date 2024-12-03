import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function day3() {
  const rawData = await loadData(dataFilePath);
  const mulPairsNoInstructions = matchAllMultiplications(rawData, false);
  const totalNoInstructions = aggregateMulPairs(mulPairsNoInstructions);
  console.log('Total without instructions:', totalNoInstructions);
  const mulPairsInstructions = matchAllMultiplications(rawData, true);
  const totalInstructions = aggregateMulPairs(mulPairsInstructions);
  console.log('Total with instructions:', totalInstructions);
}

day3();

type MulPairs = [number, number][];

function matchAllMultiplications(
  data: string,
  followInstructions: boolean = false,
) {
  const regex = createInstructionRegex(followInstructions);

  const mulPairs: MulPairs = [];
  let match;
  let aggregating = true;
  while ((match = regex.exec(data))) {
    const [matchedString, n1Str, n2Str] = match;
    if (matchedString === 'do()') {
      aggregating = true;
      continue;
    }
    if (matchedString === "don't()") {
      aggregating = false;
      continue;
    }
    if (aggregating) mulPairs.push([parseInt(n1Str), parseInt(n2Str)]);
  }

  return mulPairs;
}

function createInstructionRegex(followInstructions: boolean) {
  const mulFunctionPattern = /mul\(([0-9][0-9]?[0-9]?),([0-9][0-9]?[0-9]?)\)/
    .source;
  const instructionFunctionPattern =
    /|/.source + /do\(\)/.source + /|/.source + /don\'t\(\)/.source;
  const regex = followInstructions
    ? new RegExp(mulFunctionPattern + instructionFunctionPattern, 'g')
    : new RegExp(mulFunctionPattern, 'g');
  return regex;
}

function aggregateMulPairs(mulPairs: MulPairs) {
  return mulPairs.reduce((acc, mulPair) => {
    return acc + mulPair[0] * mulPair[1];
  }, 0);
}
