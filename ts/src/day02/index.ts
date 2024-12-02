import * as fs from 'fs';
import * as path from 'path';

type Report = number[];
type Reports = Report[];

async function main() {
  const rawData = await loadData();
  const reports = await parseData(rawData);
  const safeReports = reports.map(isReportSafe);
  console.log(safeReports);
  console.log(safeReports.length);
  console.log(safeReports.filter(Boolean).length);
}

main();

async function loadData() {
  const file = fs.readFileSync(path.join(__dirname + '/data.txt'), undefined);
  return file.toString();
}

async function parseData(rawData: string): Promise<Reports> {
  const lines = rawData.split('\n');
  const reports = [];
  for (const line of lines) {
    // console.log(line);
    const splitLineParts = line.split(/\s+/);
    // console.log(splitLineParts);
    const report = splitLineParts.map((s) => parseInt(s));
    // console.log(report);

    reports.push(report);
  }

  return reports;
}

function isReportSafe(report: Report) {
  let lastDiff = 0;
  console.log('\n\n', { report });
  for (let index = 0; index < report.length; index++) {
    const prevElement = report.at(index - 1);
    const element = report[index];

    if (index === 0) continue;
    if (!prevElement) continue;

    console.log({ prevElement, element });
    if (prevElement === element) return false;

    const diff = element - prevElement;
    const isIncrement = diff > 0;
    const lastDiffWasIncrement = lastDiff > 0;
    console.log(isIncrement, lastDiffWasIncrement);
    if (index > 1 && isIncrement !== lastDiffWasIncrement) return false;

    const absDiff = Math.abs(diff);
    console.log(absDiff);
    if (absDiff > 3) return false;

    lastDiff = diff;
  }
  return true;
}
