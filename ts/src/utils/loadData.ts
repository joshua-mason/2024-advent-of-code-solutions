import * as fs from 'fs';
import * as path from 'path';

export async function loadData(localPath: string) {
  const file = fs.readFileSync(path.join(__dirname + localPath), undefined);
  return file.toString();
}
