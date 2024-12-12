import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function run() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const tester = `AAAA
BBCD
BBCC
EEEC`;
  const tester1 = `OOOOO
OXOXO
OOOOO
OXOXO
OOOOO`;
  const tester3 = `AB
BA`;
  const input = rawData;

  let parsed = parse(input);
  console.log(parsed);

  let splitAreas = markSeparatePlots(parsed);
  console.log(splitAreas);

  let measurements = getMeasurements(splitAreas);
  console.log(measurements);

  const a = Object.entries(measurements).reduce((acc, [k, v]) => {
    console.log(acc, k, v);
    acc += v.area * v.perimeter;

    return acc;
  }, 0);
  //   1381056
  //   1386242 too high
  console.log(a);
}

run();

function parse(mapStr: string) {
  return mapStr.split('\n').map((row) =>
    row.split('').map((t) => {
      return t;
    }),
  );
}

function getMeasurements(mapG: string[][]) {
  let data: {
    [char: string]: {
      perimeter: number;
      area: number;
    };
  } = {};

  const perimeterTiles = new Map<string, string[]>();

  mapG.forEach((row, rowIdx) => {
    row.forEach((tile, colIdx) => {
      let { perimeter, area } = calcTileContribution(
        tile,
        rowIdx,
        colIdx,
        mapG,
        perimeterTiles,
      );

      if (!data[tile]) {
        // console.log(1);
        data[tile] = {
          perimeter,
          area,
        };
        // console.log(data);
      } else {
        // console.log(2);
        data[tile]['perimeter'] = data[tile]['perimeter'] + perimeter;
        data[tile]['area'] = data[tile]['area'] + area;
        // console.log(data);
      }
    });
  });
  return data;
}

function calcTileContribution(
  tile: string,
  rowIdx: number,
  colIdx: number,
  mapG: string[][],
  perimeterTiles: Map<string, string[]>,
) {
  const previousRowIndex = rowIdx - 1;
  const nextRowIndex = rowIdx + 1;
  const previousColumnIndex = colIdx - 1;
  const nextColumnIndex = colIdx + 1;

  const aboveTile =
    previousRowIndex >= 0 && mapG.at(previousRowIndex)?.at(colIdx);
  const belowTile = nextRowIndex >= 0 && mapG.at(nextRowIndex)?.at(colIdx);
  const leftTile =
    previousColumnIndex >= 0 && mapG.at(rowIdx)?.at(previousColumnIndex);
  const rightTile =
    nextColumnIndex >= 0 && mapG.at(rowIdx)?.at(nextColumnIndex);
  //   console.log({
  //     aboveTile,
  //     belowTile,
  //     leftTile,
  //     rightTile,
  //   });
  let p = 0;
  if (aboveTile !== tile) {
    const existing = perimeterTiles.get(tile);
    // if (existing && existing.includes(`${previousRowIndex},${colIdx}`)) {
    // } else {
    perimeterTiles.set(tile, [
      ...(existing || []),
      `${previousRowIndex},${colIdx}`,
    ]);
    p++;
  }
  //   }
  if (belowTile !== tile) {
    const existing = perimeterTiles.get(tile);
    // if (existing && existing.includes(`${nextRowIndex},${colIdx}`)) {
    // } else {
    perimeterTiles.set(tile, [
      ...(existing || []),
      `${nextRowIndex},${colIdx}`,
    ]);
    p++;
  }
  //   }
  if (leftTile !== tile) {
    const existing = perimeterTiles.get(tile);
    // if (existing && existing.includes(`${rowIdx},${previousColumnIndex}`)) {
    // } else {
    perimeterTiles.set(tile, [
      ...(existing || []),
      `${rowIdx},${previousColumnIndex}`,
    ]);

    p++;
    // }
  }
  if (rightTile !== tile) {
    const existing = perimeterTiles.get(tile);
    // if (existing && existing.includes(`${rowIdx},${nextColumnIndex}`)) {
    // } else {
    perimeterTiles.set(tile, [
      ...(existing || []),
      `${rowIdx},${nextColumnIndex}`,
    ]);
    p++;
  }
  //   }
  return {
    perimeter: p,
    area: 1,
  };
}

interface Section {
  newTile: string;
  tiles: [number, number][];
}

function markSeparatePlots(parsedGrid: string[][]): string[][] {
  const tilesChecked: string[] = [];
  const sections: Section[] = [];
  for (let rowIdx = 0; rowIdx < parsedGrid.length; rowIdx++) {
    for (let colIdx = 0; colIdx < parsedGrid.length; colIdx++) {
      const tile = parsedGrid[rowIdx][colIdx];
      console.log(`start checking section at ${rowIdx} ${colIdx}: ${tile}`);
      if (tile === '.') {
        console.log('skipping actually');
        continue;
      }
      const section: Section = getSection(
        rowIdx,
        colIdx,
        parsedGrid,
        tilesChecked,
      );
      sections.push(section);
      tilesChecked.push(section.newTile);
      for (const tile of section.tiles) {
        parsedGrid[tile[0]][tile[1]] = '.';
      }
    }
  }

  for (const section of sections) {
    for (const tile of section.tiles) {
      parsedGrid[tile[0]][tile[1]] = section.newTile;
    }
  }
  return parsedGrid;
}

function getSection(
  rowIdx: number,
  colIdx: number,
  parsedGrid: string[][],
  tilesChecked: string[],
): Section {
  // const tile = parsedGrid[rowIdx][colIdx];

  const originalTile = parsedGrid[rowIdx][colIdx];
  let tilesToCheck: [number, number][] = [[rowIdx, colIdx]];
  const tile = tilesChecked.includes(originalTile)
    ? originalTile + `${rowIdx},${colIdx}`
    : originalTile;
  console.log({ tile });
  const section: Section = {
    newTile: tile,
    tiles: [],
  };
  let i = 0;
  while (tilesToCheck.length > 0) {
    console.log(`tilesToCheck: ${tilesToCheck.length}`);
    i++;
    const tileToCheck = tilesToCheck.pop();
    if (!tileToCheck) break;
    const tileStr = parsedGrid[tileToCheck[0]][tileToCheck[1]];
    console.log({
      tileStr,
      tileToCheck,
    });
    if (tileStr === '.') continue;
    section.tiles.push(tileToCheck);
    const nextTiles = getMatchingNeighbourTiles(
      tileStr,
      tileToCheck[0],
      tileToCheck[1],
      parsedGrid,
    );
    tilesToCheck = tilesToCheck.concat(nextTiles);
    parsedGrid[tileToCheck[0]][tileToCheck[1]] = '.';
    // if (i > 5) break;
  }
  console.log({ section, tilesChecked });
  return section;
}

function getMatchingNeighbourTiles(
  tile: string,
  rowIdx: number,
  colIdx: number,
  parsedGrid: string[][],
): [number, number][] {
  const previousRowIndex = rowIdx - 1;
  const nextRowIndex = rowIdx + 1;
  const previousColumnIndex = colIdx - 1;
  const nextColumnIndex = colIdx + 1;

  const aboveTile =
    previousRowIndex >= 0 && parsedGrid.at(previousRowIndex)?.at(colIdx);
  const belowTile =
    nextRowIndex >= 0 && parsedGrid.at(nextRowIndex)?.at(colIdx);
  const leftTile =
    previousColumnIndex >= 0 && parsedGrid.at(rowIdx)?.at(previousColumnIndex);
  const rightTile =
    nextColumnIndex >= 0 && parsedGrid.at(rowIdx)?.at(nextColumnIndex);

  const correspondingTiles: [number, number][] = [];

  if (aboveTile === tile) correspondingTiles.push([previousRowIndex, colIdx]);
  if (belowTile === tile) correspondingTiles.push([nextRowIndex, colIdx]);
  if (leftTile === tile) correspondingTiles.push([rowIdx, previousColumnIndex]);
  if (rightTile === tile) correspondingTiles.push([rowIdx, nextColumnIndex]);
  return correspondingTiles;
}
