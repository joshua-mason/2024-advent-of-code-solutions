// note: more than 592, less than ~660

import * as fs from 'fs';
import * as path from 'path';

type Report = number[];
type Reports = Report[];

async function main() {
  const rawData = await loadData();
  const reports = await parseData(rawData);
  const validatedReports = reports.map(isReportSafe);
  // console.log(validatedReports);
  // console.log(validatedReports.length);
  const safeReportsCount = validatedReports.filter((r) => r.safe).length;
  // console.log(validatedReports);

  const unsafeReportData = validatedReports.filter((r) => !r.safe);

  const safeOnSecondCheck = [];
  for (const reportData of unsafeReportData) {
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
    // for (const errorIndex of reportData.errorIndexes) {
    //   const reportWithoutErrorIndex = [...originalReport].filter(
    //     (_, i) => i !== errorIndex,
    //   );
    //   const validatedReport = isReportSafe(
    //     reportWithoutErrorIndex,
    //     reportData.reportIndex,
    //   );
    //   if (validatedReport.safe) {
    //     safeOnSecondCheck.push(reportData.reportIndex);
    //     break;
    //   }
    // }
  }

  // const unsafeReportsWithRemovedLevel = unsafeReports.map((r, index) => {
  //   const report = reports[r.reportIndex];
  //   let newReport: number[];
  //   if (r.errorIndex === 0) {
  //     newReport = report.slice(1);
  //   } else if (r.errorIndex === report.length) {
  //     newReport = report.slice(0, 5);
  //   } else {
  //     newReport = report
  //       .slice(0, r.errorIndex)
  //       .concat(report.slice(r.errorIndex + 1));
  //   }
  //   console.log({ r, report, newReport });
  //   return newReport;
  // });

  // console.log(unsafeReportsWithRemovedLevel);

  // const validatedSecondRoundReports =
  //   unsafeReportsWithRemovedLevel.map(isReportSafe);
  // const safeSecondRoundReportsCount = validatedSecondRoundReports.filter(
  //   (r) => r.safe,
  // ).length;
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
    // console.log(line);
    const splitLineParts = line.split(/\s+/);
    // console.log(splitLineParts);
    const report = splitLineParts.map((s) => parseInt(s));
    // console.log(report);

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

    // console.log({ prevElement, element });
    if (prevElement === element) {
      safe = false;
      errorIndexes.push(index);
      lastDiff = diff;
    }

    const isIncrement = diff > 0;
    const lastDiffWasIncrement = lastDiff > 0;
    // console.log(isIncrement, lastDiffWasIncrement);
    if (index > 1 && isIncrement !== lastDiffWasIncrement) {
      safe = false;
      errorIndexes.push(index);
      lastDiff = diff;
    }

    const absDiff = Math.abs(diff);
    // console.log(absDiff);
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

// function isReportSafeWithDampener(report: Report) {
//   let lastDiff = 0;
//   let failCount = 0;
//   console.log('\n\n', { report });
//   for (let index = 0; index < report.length; index++) {
//     const prevElement = report.at(index - 1);
//     const element = report[index];

//     if (index === 0) continue;
//     if (!prevElement) continue;

//     console.log({ prevElement, element });
//     if (prevElement === element) {
//       if (failCount === 1) return false;
//       else {
//         failCount++;
//         continue;
//       }
//     }

//     const diff = element - prevElement;
//     const isIncrement = diff > 0;
//     const lastDiffWasIncrement = lastDiff > 0;
//     console.log(isIncrement, lastDiffWasIncrement);
//     if (index > 1 && isIncrement !== lastDiffWasIncrement) {
//       if (failCount === 1) return false;
//       else {
//         failCount++;
//         continue;
//       }
//     }

//     const absDiff = Math.abs(diff);
//     console.log(absDiff);
//     if (absDiff > 3) {
//       if (failCount === 1) return false;
//       else {
//         failCount++;
//         continue;
//       }
//     }

//     lastDiff = diff;
//   }
//   return true;
// }
