import * as fs from 'fs';
import * as path from 'path';

async function loadData() {
    const file = fs.readFileSync(path.join(__dirname + "/data.txt"), undefined);
    return file.toString()
}

interface LocationIDs {
    firstList: number[];
    secondList: number[];
}

async function parseData(rawData: string): Promise<LocationIDs> {
    const lines = rawData.split("\n");
    const firstList: number[] = [];
    const secondList: number[] = [];

    lines.map(line => {
        const [firstNumber, secondNumber] = line.split(/\s+/)
        firstList.push(parseInt(firstNumber));
        secondList.push(parseInt(secondNumber));
    })

    return {
        firstList,
        secondList
    }
}

function sortData(data: LocationIDs): LocationIDs {
    return {
        firstList: [...data.firstList].sort(),
        secondList: [...data.secondList].sort(),
    }
}

function sumOfDiffs(data: LocationIDs): number {
    let sum = 0;
    for (let index = 0; index < data.firstList.length; index++) {
        const n1 = data.firstList[index];
        const n2 = data.secondList[index];
        const diff = Math.abs(n1 - n2)
        sum += diff;
    }
    return sum
}

async function main() {
    const rawData = await loadData();
    const data = await parseData(rawData);
    const sortedData = await sortData(data)
    const totalDistance = sumOfDiffs(sortedData)
    console.log(totalDistance)
}

main()


