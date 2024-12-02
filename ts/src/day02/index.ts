// note: more than 592, less than ~660

import * as fs from 'fs';
import * as path from 'path';

type Report = number[];
type Reports = Report[];

async function main() {
  const rawData = await loadData();
  const reports = await parseData(rawData);
  const validatedReports = reports.map(isReportSafe);
  const safeOnSecondCheck = validatedReports
    .filter((r) => !r.safe)
    .filter(validateWithProblemDampener);

  const safeOnFirstCheckCount = validatedReports.filter((r) => r.safe).length;
  const safeOnSecondCheckCount = safeOnSecondCheck.length;

  console.log(`First round safe: ${safeOnFirstCheckCount}
Second round safe: ${safeOnSecondCheckCount}
Total: ${safeOnFirstCheckCount + safeOnSecondCheckCount}`);
}

main();

function validateWithProblemDampener(reportData: {
  safe: false;
  report: number[];
}) {
  const originalReport = reportData.report;
  for (let index = 0; index < originalReport.length; index++) {
    const reportWithoutErrorIndex = [...originalReport].filter(
      (_, i) => i !== index,
    );
    const validatedReport = isReportSafe(reportWithoutErrorIndex);
    if (validatedReport.safe) {
      return true;
    }
  }
  return false;
}
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
): { safe: true } | { safe: false; report: number[] } {
  let lastDiff = 0;
  const errorIndexes = [];
  let safe = true;

  for (let index = 0; index < report.length; index++) {
    const prevElement = report.at(index - 1);
    const element = report[index];

    if (index === 0 || !prevElement) continue;

    const diff = element - prevElement;

    if (prevElement === element) {
      return { safe: false, report };
    }

    const isIncrement = diff > 0;
    const lastDiffWasIncrement = lastDiff > 0;
    if (index > 1 && isIncrement !== lastDiffWasIncrement) {
      return { safe: false, report };
    }

    const absDiff = Math.abs(diff);
    if (absDiff > 3) {
      return { safe: false, report };
    }

    lastDiff = diff;
  }
  return safe
    ? { safe }
    : {
        safe,
        report,
      };
}
