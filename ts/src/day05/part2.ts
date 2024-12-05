import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function part2() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);

  const rules = loadRules(rawData);

  const pageOrders = loadPageOrders(rawData);

  const incorrectPageOrders: number[][] = [];

  const middlePages: number[] = [];
  for (const pageOrder of pageOrders) {
    const isValid = validatePages(pageOrder, rules);
    if (isValid) {
      middlePages.push(pageOrder[(pageOrder.length - 1) / 2]);
    } else {
      incorrectPageOrders.push(pageOrder);
    }
  }

  console.log(
    `sum of valid middle pages: ${middlePages.reduce((acc, x) => acc + x, 0)}`,
  );

  const middlePagesFixed: number[] = [];

  for (const pageOrder of incorrectPageOrders) {
    let fixedPages: number[] = pageOrder;
    while ((fixedPages = fixPage(fixedPages, rules))) {
      const isValid = validatePages(fixedPages, rules);
      if (isValid) break;
    }
    middlePagesFixed.push(fixedPages[(fixedPages.length - 1) / 2]);
  }
  console.log(
    `sum of fixed middle pages: ${middlePagesFixed.reduce((acc, x) => acc + x, 0)}`,
  );
}

part2();

type Rules = Map<number, number[]>;

function loadRules(data: string): Rules {
  const rawRules = data.split('\n\n').at(0);
  const ruleStrs = rawRules?.split('\n');
  const ruleMap = new Map<number, number[]>();
  ruleStrs?.forEach((ruleStr) => {
    const [beforeStr, afterStr] = ruleStr.split('|');
    const [before, after] = [parseInt(beforeStr), parseInt(afterStr)];
    const beforeRuleFound = ruleMap.get(before);
    if (beforeRuleFound) {
      ruleMap.set(before, [...beforeRuleFound, after]);
    } else ruleMap.set(before, [after]);
  });
  return ruleMap;
}

function loadPageOrders(data: string) {
  const rawPageOrders = data.split('\n\n').at(1);
  if (!rawPageOrders) throw new Error('Could not load page orders');
  return rawPageOrders
    .split('\n')
    .map((pageOrdersStr) =>
      pageOrdersStr.split(',').map((str) => parseInt(str)),
    );
}

function validatePages(pageOrder: number[], rules: Rules) {
  for (let pageIndex = 0; pageIndex < pageOrder.length; pageIndex++) {
    const page = pageOrder[pageIndex];
    const pageRules = rules.get(page);
    if (!pageRules) {
      continue;
    }
    const pagesBefore = pageOrder.slice(0, pageIndex);
    if (arrayContainsArray(pageRules, pagesBefore)) {
      return false;
    }
  }
  return true;
}

function arrayContainsArray(arr1: number[], arr2: number[]) {
  return arr1.map((e) => arr2.includes(e)).some((a) => a);
}

// actually unnecessary but I wonder if we could speed the process up with this
function arrayContainsArrayReturnInclusive(arr1: number[], arr2: number[]) {
  const matches = arr1.filter((e) => arr2.includes(e));
  if (matches.length === 0) return undefined;
  return matches;
}

function fixPage(pageOrder: number[], rules: Rules) {
  const newPageOrder = [...pageOrder];
  for (let pageIndex = 0; pageIndex < pageOrder.length; pageIndex++) {
    const page = newPageOrder[pageIndex];
    const pageRules = rules.get(page);
    if (!pageRules) {
      continue;
    }
    const pagesBefore = newPageOrder.slice(0, pageIndex);
    let offendingPages: number[] | undefined;
    while (
      (offendingPages = arrayContainsArrayReturnInclusive(
        pageRules,
        pagesBefore,
      ))
    ) {
      const previousPage = newPageOrder[pageIndex - 1];
      newPageOrder[pageIndex - 1] = page;
      newPageOrder[pageIndex] = previousPage;
      break;
    }
  }
  return newPageOrder;
}
