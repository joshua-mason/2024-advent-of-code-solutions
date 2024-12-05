import { loadData } from '../utils/loadData';

const testDataFilePath = __dirname + '/testData.txt';
const dataFilePath = __dirname + '/data.txt';

async function part1() {
  const rawData = await loadData(dataFilePath);
  const rawTestData = await loadData(testDataFilePath);

  const rules = loadRules(rawData);

  const pageOrders = loadPageOrders(rawData);

  const middlePages: number[] = [];
  for (const pageOrder of pageOrders) {
    const validated = validatePages(pageOrder, rules);
    if (validated) {
      middlePages.push(pageOrder[(pageOrder.length - 1) / 2]);
    }
  }

  console.log(
    `sum of middle pages: ${middlePages.reduce((acc, x) => acc + x, 0)}`,
  );
}

part1();

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
