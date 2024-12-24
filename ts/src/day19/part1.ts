import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const testData2FilePath = __dirname + '/testData2.txt';
const dataFilePath = __dirname + '/data.txt';
interface MatchMap {
  matchPattern: number[];
  towel: string;
}
async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);
  const rawTestData2 = await loadData(testData2FilePath);
  const input = rawData;

  const { towels, patternsRequired } = parseData(input);

  towels.sort((a, b) => {
    const lengthDiff = b.length - a.length;
    if (lengthDiff !== 0) return lengthDiff;
    return 0;
  });
  let i = 0;
  let x = 0;
  for (const pattern of patternsRequired.slice(0, 1000)) {
    console.log(`Check pattern ${i}`);
    i++;
    const stripesAllocatedFor: number[] = new Array(pattern.length).fill(0);
    let mutPattern = JSON.parse(JSON.stringify(pattern));

    const matchMaps: MatchMap[] = [];
    for (const towel of towels) {
      const matchMap: number[] = new Array(pattern.length).fill(0);
      let idxOfTowelMatch = pattern.indexOf(towel);
      while (idxOfTowelMatch !== -1) {
        if (idxOfTowelMatch !== -1) {
          for (
            let index = idxOfTowelMatch;
            index <= idxOfTowelMatch + towel.length - 1;
            index++
          ) {
            stripesAllocatedFor[index] = 1;
            matchMap[index] = 1;
          }
        }
        idxOfTowelMatch = pattern.indexOf(towel, idxOfTowelMatch + 1);
        if (matchMap.some(Boolean)) {
          matchMaps.push({
            matchPattern: JSON.parse(JSON.stringify(matchMap)),
            towel,
          });
          matchMap.fill(0);
        }
      }
      mutPattern = mutPattern.split(towel).join(' ');
    }

    let possible: boolean =
      matchMaps.length > 0 ? checkMatchMap(matchMaps) : false;

    let runs = 0;
    while (!possible) {
      runs++;
      shuffle(matchMaps);

      possible = matchMaps.length > 0 ? checkMatchMap(matchMaps) : false;
      if (possible) {
        console.log(`possible at shuffle ${runs}`);
      }
      if (runs > 25) break;
    }

    if (possible) x++;
  }
  console.log({
    x,
  });
}

part1();

function parseData(input: string): {
  towels: string[];
  patternsRequired: string[];
} {
  const [towelsStr, patternsRequiredStr] = input.split('\n\n');

  const towels = towelsStr.split(', ');
  const patternsRequired = patternsRequiredStr.split('\n');

  return {
    towels,
    patternsRequired,
  };
}

function checkMatchMap(matchMaps: MatchMap[]): boolean {
  let patternAttempt = new Array(matchMaps[0].matchPattern.length).fill(0);

  for (let index = 0; index < matchMaps[0].matchPattern.length + 1; index++) {
    const el = matchMaps.shift();
    if (!el) throw new Error('No match maps');
    matchMaps.push(el);
    for (const map of matchMaps) {
      patternAttempt = applyMatches(patternAttempt, map.matchPattern);
    }
    if (patternAttempt.every(Boolean)) {
      return true;
    }
    patternAttempt = patternAttempt.fill(0);
  }
  matchMaps.reverse();
  for (let index = 0; index < matchMaps[0].matchPattern.length + 1; index++) {
    const el = matchMaps.shift();
    if (!el) throw new Error('No match maps');
    matchMaps.push(el);
    for (const map of matchMaps) {
      patternAttempt = applyMatches(patternAttempt, map.matchPattern);
    }
    if (patternAttempt.every(Boolean)) {
      return true;
    }
    patternAttempt = patternAttempt.fill(0);
  }

  return false;
}

function applyMatches(patternAttempt: number[], map: number[]): number[] {
  const copyPatternAttempt = JSON.parse(JSON.stringify(patternAttempt));
  let failed = false;
  map.forEach((v, idx) => {
    if (v === 0) return;
    if (patternAttempt[idx] > 0) {
      failed = true;

      return;
    }
    copyPatternAttempt[idx] = v;
  });

  return failed ? patternAttempt : copyPatternAttempt;
}

function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}
