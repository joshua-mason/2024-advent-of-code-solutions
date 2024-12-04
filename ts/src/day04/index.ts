import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function day4() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);

  const allLines = parseToAllLines(rawData);
  const count = allLines
    .flatMap((a) => a.map(countXMASInString))
    .reduce((acc, n) => acc + n, 0);

  console.log(count);
}

day4();

function countXMASInString(str: string) {
  const regex = /XMAS/g;
  let count = 0;
  let m;
  while ((m = regex.exec(str))) {
    count++;
  }
  return count;
}

function parseToAllLines(rawData: string): string[][] {
  const lines: string[][] = [];

  // leftToRightRow
  lines.push([]);
  for (const row of rawData.split('\n')) {
    lines[0].push(row);
  }
  // rightToLeftRow
  lines.push([]);
  for (const row of rawData.split('\n')) {
    lines[1].push(row.split('').reverse().join(''));
  }

  const transposedData = transposeString(rawData);

  // topToBottomCol
  lines.push([]);
  for (const row of transposedData) {
    lines[2].push(row.join(''));
  }

  // bottomToTopCol
  lines.push([]);
  for (const row of transposedData) {
    lines[3].push(row.reverse().join(''));
  }

  // diagonals
  const rows = rawData.split('\n').map((str) => str.split(''));
  for (let index = 0; index < 4; index++) {
    let array = JSON.parse(JSON.stringify(rows)) as string[][];
    for (let j = 0; j < index; j++) {
      array = rotateArray(array);
    }
    const diagonals = extractDiagonalStrings(array);
    const diagonal = index > 1 ? diagonals[0].slice(1) : diagonals[0];
    lines.push(diagonal);
    lines.push(diagonal.map((d) => d.split('').reverse().join('')));
  }

  return lines;
}

function transposeString(data: string) {
  const rows = data.split('\n').map((str) => str.split(''));
  const newData: string[][] = rows.map((_) => []);
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const character = row[colIdx];
      newData[colIdx].push(character);
    }
  }
  return newData;
}

function rotateArray(rows: string[][]) {
  return rows.map((_, index) => rows.map((row) => row[index]).reverse());
}

function extractDiagonalStrings(rows: string[][]) {
  const downAndRight: string[] = [];
  const upAndRight: string[] = [];

  let offset = 0;
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    let diagonalDown: string[] = [];
    for (let rowOffset = 0; rowOffset < rows[0].length; rowOffset++) {
      const currentRowValue = rows
        .at(rowIdx + rowOffset)
        ?.at(rowIdx + rowOffset - offset);
      if (!currentRowValue) {
        break;
      }
      diagonalDown.push(currentRowValue);
    }
    offset++;
    downAndRight.push(diagonalDown.join(''));
  }

  offset = 0;
  for (let rowIdx = rows[0].length - 1; rowIdx >= 0; rowIdx--) {
    let diagonalDown: string[] = [];
    for (let colIdx = 0; colIdx < rows[0].length; colIdx++) {
      if (rowIdx - colIdx < 0 || colIdx < 0) break;
      const currentRowValue = rows.at(rowIdx - colIdx)?.at(colIdx);
      if (!currentRowValue) {
        break;
      }
      diagonalDown.push(currentRowValue);
    }
    offset++;
    upAndRight.push(diagonalDown.join(''));
  }

  return [downAndRight, upAndRight];
}
