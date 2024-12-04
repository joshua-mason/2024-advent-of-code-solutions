import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function part2() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);

  const count = countXmasCrosses(rawData);
  console.log({ count });
}

part2();

function countXmasCrosses(rawData: string): number {
  const rows = rawData.split('\n').map((str) => str.split(''));

  let count = 0;

  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const character = row[colIdx];
      if (character === 'A') {
        const isCross = checkSquare(rowIdx, colIdx, rows);
        if (isCross) count++;
      }
    }
  }

  return count;
}

function checkSquare(rowIdx: number, colIdx: number, rows: string[][]) {
  if (
    rowIdx === 0 ||
    rowIdx > rows.length - 1 ||
    colIdx === 0 ||
    colIdx > rows.length - 1
  ) {
    return false;
  }
  if (!rows.at(rowIdx - 1) || !rows.at(rowIdx + 1)) return false;
  if (!rows[0].at(colIdx - 1) || !rows[0].at(colIdx + 1)) return false;

  const topRight = rows[rowIdx - 1][colIdx + 1];
  const topLeft = rows[rowIdx - 1][colIdx - 1];
  const bottomRight = rows[rowIdx + 1][colIdx + 1];
  const bottomLeft = rows[rowIdx + 1][colIdx - 1];

  if (
    (topLeft + bottomRight === 'MS' || topLeft + bottomRight === 'SM') &&
    (bottomLeft + topRight === 'MS' || bottomLeft + topRight === 'SM')
  ) {
    return true;
  }
}
