import * as fs from 'fs';
import * as path from 'path';

export async function loadData(filePath: string) {
  const file = fs.readFileSync(path.join(filePath), undefined);
  return file.toString();
}
