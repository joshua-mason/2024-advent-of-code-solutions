import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function day4() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);

  // const allLines = parseToAllLines(rawData);

  //   const data = `\
  // XBMX
  // CMM.
  // CAA.
  // SM.S`;
  const data = `\
.XS...
..MA..
S..AM.
.A..SX
..M...
...X..`; // one counted twice and the others not counted at all...
  const allLines = parseToAllLines(rawData);
  console.log({ final: allLines });

  const b = allLines
    .flatMap((a) => a.map(countXMASInString))
    .reduce((acc, n) => acc + n, 0);

  console.log(b);
}

day4();

function countXMASInString(str: string) {
  const regex = /XMAS/g;

  let count = 0;
  let m;
  while ((m = regex.exec(str))) {
    count++;
  }
  console.log(str, count);
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

  const rows = rawData.split('\n').map((str) => str.split(''));

  // const diagonals = takeDiagonals(rows);
  // lines.push(diagonals[0], diagonals[1]);
  // lines.push(
  //   diagonals[0].map((d) => d.split('').reverse().join('')),
  //   diagonals[1].map((d) => d.split('').reverse().join('')),
  // );
  for (let index = 0; index < 4; index++) {
    let array = JSON.parse(JSON.stringify(rows)) as string[][];
    for (let j = 0; j < index; j++) {
      console.log('rotateArray');
      array = rotateArray(array);
    }
    console.log({ array });
    const diagonals = takeDiagonals(array);
    const diagonal = index > 1 ? diagonals[0].slice(1) : diagonals[0];
    lines.push(diagonal);
    lines.push(diagonal.map((d) => d.split('').reverse().join('')));
  }

  // issue appears to be in these last ones?
  // const diagonalsTransposed = takeDiagonals(transposedData);
  // lines.push(diagonalsTransposed[0].slice(1), diagonalsTransposed[1].slice(1));
  // lines.push(
  //   diagonalsTransposed[0].slice(1).map((d) => d.split('').reverse().join('')),
  //   diagonalsTransposed[1].slice(1).map((d) => d.split('').reverse().join('')),
  // );
  // lines.concat(diagonals);
  // const diagonals2 = takeDiagonals(transposedData);
  // lines.concat(diagonals2);
  // console.log({ lines, diagonals });
  // lines.push(diagonals[0]);
  // lines.push(diagonals[1]);
  // lines.push(diagonals2[0]);
  // lines.push(diagonals2[1]);
  return lines;
}

function transposeString(data: string) {
  const rows = data.split('\n').map((str) => str.split(''));
  // console.log({
  //   rowLength: rows[0].length,
  //   nRows: rows.length,
  // });
  const newData: string[][] = rows.map((_) => []);
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    // console.log(row, newData);
    // newData.push([]);
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const character = row[colIdx];
      newData[colIdx].push(character);
    }
  }
  return newData;
}

function transposeArray(rows: string[][]) {
  // const rows = data.split('\n').map((str) => str.split(''));
  // console.log({
  //   rowLength: rows[0].length,
  //   nRows: rows.length,
  // });
  const newData: string[][] = rows.map((_) => []);
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    // console.log(row, newData);
    // newData.push([]);
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const character = row[colIdx];
      newData[colIdx].push(character);
    }
  }
  return newData;
}

function rotateArray(rows: string[][]) {
  // const rows = data.split('\n').map((str) => str.split(''));
  // console.log({
  //   rowLength: rows[0].length,
  //   nRows: rows.length,
  // });
  return rows.map((val, index) => rows.map((row) => row[index]).reverse());

  // const newData: string[][] = rows.map((_) => []);
  // for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
  //   const row = rows[rowIdx];
  //   // console.log(row, newData);
  //   // newData.push([]);
  //   for (let colIdx = 0; colIdx < row.length; colIdx++) {
  //     const character = row[colIdx];
  //     newData[colIdx].push(character);
  //   }
  // }
  // return newData;
}

function takeDiagonals(rows: string[][]) {
  // const rows = data.split('\n').map((str) => str.split(''));
  const newData: string[] = [];

  const downAndRight: string[] = [];
  const upAndRight: string[] = [];

  let offset = 0;
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    let diagonalDown: string[] = [];
    for (let rowOffset = 0; rowOffset < rows[0].length; rowOffset++) {
      // console.log(
      //   `downAndRight: take ${rowIdx + rowOffset}, ${rowIdx + rowOffset - offset}`,
      // );
      const currentRowValue = rows
        .at(rowIdx + rowOffset)
        ?.at(rowIdx + rowOffset - offset);
      if (!currentRowValue) {
        // console.log('break');
        break;
      }
      diagonalDown.push(currentRowValue);
    }
    offset++;
    // console.log(`increment offset: ${offset}}`);
    // console.log({ diagonalDown });
    // downAndRight.push(diagonalDown);

    downAndRight.push(diagonalDown.join(''));
  }

  // offset = 0;
  // for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
  //   let diagonalDown: string[] = [];
  //   for (let rowOffset = rows[0].length - 1; rowOffset >= 0; rowOffset--) {
  //     const x = rowOffset - rowIdx;
  //     const y = rowIdx + rowOffset - (rows[0].length - 1);
  //     console.log(`upAndRight: take ${x}, ${y}`);
  //     if (x < 0 || y < 0) break;
  //     const currentRowValue = rows.at(x)?.at(y);
  //     console.log(currentRowValue);
  //     if (!currentRowValue) {
  //       console.log('break');
  //       break;
  //     }
  //     diagonalDown.push(currentRowValue);
  //   }
  //   offset++;
  //   console.log(`increment offset: ${offset}}`);
  //   console.log({ diagonalDown });
  //   // upAndRight.push(diagonalDown);

  //   upAndRight.push(diagonalDown);
  // }

  offset = 0;
  for (let rowIdx = rows[0].length - 1; rowIdx >= 0; rowIdx--) {
    let diagonalDown: string[] = [];
    for (let colIdx = 0; colIdx < rows[0].length; colIdx++) {
      const rowIndex = colIdx - rowIdx;
      const y = rowIdx + colIdx - (rows[0].length - 1);
      // console.log(`upAndRight: take ${rowIdx - colIdx}, ${colIdx}`);
      if (rowIdx - colIdx < 0 || colIdx < 0) break;
      const currentRowValue = rows.at(rowIdx - colIdx)?.at(colIdx);
      // console.log(currentRowValue);
      if (!currentRowValue) {
        // console.log('break');
        break;
      }
      diagonalDown.push(currentRowValue);
    }
    offset++;
    // console.log(`increment offset: ${offset}}`);
    // console.log({ diagonalDown });
    // upAndRight.push(diagonalDown);

    upAndRight.push(diagonalDown.join(''));
  }

  // console.log({
  //   downAndRight: downAndRight,
  //   upAndRight: upAndRight,
  // });
  return [downAndRight, upAndRight];
}
