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

interface RepeatFrequency {
    value: number;
    occurrences: number;
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


function getRepeatFrequencies(data: LocationIDs): RepeatFrequency[] {
    const repeatedValues: RepeatFrequency[] = []
    for (const firstListValue of data.firstList) {
        const occurrences = data.secondList.filter(secondListValue => secondListValue === firstListValue).length
        repeatedValues.push({
            value: firstListValue,
            occurrences: occurrences
        })
    }
    return repeatedValues
}

function calculateSimilarityScore(repeatFrequencies: RepeatFrequency[]) {
    let score = 0;
    for (const frequency of repeatFrequencies) {
        score += frequency.occurrences * frequency.value;
    }
    return score
}

async function main() {
    const rawData = await loadData();
    const data = await parseData(rawData);
    const sortedData = sortData(data)
    const totalDistance = sumOfDiffs(sortedData)
    console.log("Sum of sorted differences:", totalDistance)

    const repeatFrequencies = getRepeatFrequencies(data);
    const similarityScore = calculateSimilarityScore(repeatFrequencies);
    console.log("Similarity score: ", similarityScore);
}

main()


