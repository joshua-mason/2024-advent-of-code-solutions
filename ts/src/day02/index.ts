// note: more than 592, less than ~660

import * as fs from 'fs';
import * as path from 'path';

type Report = number[];
type Reports = Report[];

async function main() {
  const rawData = await loadData();
  const reports = await parseData(rawData);
  const validatedReports = reports.map(isReportSafe);
  const safeReportsCount = validatedReports.filter((r) => r.safe).length;

  const unsafeValidatedReports = validatedReports.filter((r) => !r.safe);

  const safeOnSecondCheck = [];
  for (const reportData of unsafeValidatedReports) {
    const index = 0;
    reportData.errorIndexes.filter((_, i) => i !== index);
    const originalReport = reports[reportData.reportIndex];
    for (let index = 0; index < originalReport.length; index++) {
      const reportWithoutErrorIndex = [...originalReport].filter(
        (_, i) => i !== index,
      );
      const validatedReport = isReportSafe(
        reportWithoutErrorIndex,
        reportData.reportIndex,
      );
      if (validatedReport.safe) {
        safeOnSecondCheck.push(reportData.reportIndex);
        break;
      }
    }
  }

  console.log(`First round safe: ${safeReportsCount}
Second round safe: ${safeOnSecondCheck.length}
Total: ${safeReportsCount + safeOnSecondCheck.length}`);
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
    const splitLineParts = line.split(/\s+/);
    const report = splitLineParts.map((s) => parseInt(s));

    reports.push(report);
  }

  return reports;
}

function isReportSafe(
  report: Report,
  reportIndex: number,
):
  | { safe: true; reportIndex: number }
  | { safe: false; errorIndexes: number[]; reportIndex: number } {
  let lastDiff = 0;
  const errorIndexes = [];
  let safe = true;

  for (let index = 0; index < report.length; index++) {
    const prevElement = report.at(index - 1);
    const element = report[index];

    if (index === 0) continue;
    if (!prevElement) continue;
    const diff = element - prevElement;

    if (prevElement === element) {
      safe = false;
      errorIndexes.push(index);
      lastDiff = diff;
    }

    const isIncrement = diff > 0;
    const lastDiffWasIncrement = lastDiff > 0;
    if (index > 1 && isIncrement !== lastDiffWasIncrement) {
      safe = false;
      errorIndexes.push(index);
      lastDiff = diff;
    }

    const absDiff = Math.abs(diff);
    if (absDiff > 3) {
      safe = false;
      errorIndexes.push(index);
      lastDiff = diff;
    }

    lastDiff = diff;
  }
  if (safe) {
    return { safe: true, reportIndex };
  } else {
    return {
      errorIndexes,
      reportIndex,
      safe,
    };
  }
}
