import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function day3() {
  const rawData = await loadData(dataFilePath);
  const mulPairs = matchAllMuls(rawData);
  const total = aggregateMulPairs(mulPairs);
  console.log('Total:', total);
}

day3();

type MulPairs = [number, number][];

function matchAllMuls(data: string) {
  const regex = /mul\(([0-9][0-9]?[0-9]?),([0-9][0-9]?[0-9]?)\)+/g;
  const mulPairs: MulPairs = [];
  let match;
  while ((match = regex.exec(data))) {
    const [_, n1Str, n2Str] = match;
    mulPairs.push([parseInt(n1Str), parseInt(n2Str)]);
  }

  return mulPairs;
}

function aggregateMulPairs(mulPairs: MulPairs) {
  return mulPairs.reduce((acc, mulPair) => {
    return acc + mulPair[0] * mulPair[1];
  }, 0);
}
