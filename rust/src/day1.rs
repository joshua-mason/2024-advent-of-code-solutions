use std::{collections::HashMap, iter::zip};

pub fn run() {
    let data = read_input_file();

    let (mut first_list, mut second_list) = read_lines_to_integer_lists(&data);

    sort_lists(&mut first_list, &mut second_list);

    let sum_of_differences = calculate_sum_of_differences(&first_list, &second_list);

    println!("Sum of differences: {}", sum_of_differences);

    let frequency_map = make_frequency_map(&second_list);

    let similarity_score = calculate_similarity_score(&first_list, frequency_map);

    println!("Similarity score: {}", similarity_score);
}

fn calculate_similarity_score(first_list: &[i32], frequency_map: HashMap<i32, usize>) -> i32 {
    first_list.iter().fold(0, |acc, &n1| {
        acc + n1 * (*frequency_map.get(&n1).unwrap_or(&0) as i32)
    })
}

fn make_frequency_map(second_list: &[i32]) -> HashMap<i32, usize> {
    let mut frequency_map: HashMap<i32, usize> = HashMap::new();

    for n1 in second_list {
        frequency_map
            .entry(*n1)
            .and_modify(|e| *e += 1)
            .or_insert(1);
    }

    frequency_map
}

fn calculate_sum_of_differences(first_list: &[i32], second_list: &[i32]) -> i32 {
    zip(first_list, second_list).fold(0, |acc, (a, b)| acc + (a - b).abs())
}

fn sort_lists(first_list: &mut Vec<i32>, second_list: &mut Vec<i32>) {
    first_list.sort();
    second_list.sort();
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day1.txt").expect("Failed to read input file 'day1.txt'")
}

fn read_lines_to_integer_lists(data: &str) -> (Vec<i32>, Vec<i32>) {
    let lines = data.lines();
    let mut first_list: Vec<i32> = vec![];
    let mut second_list: Vec<i32> = vec![];

    for line in lines {
        let mut split_line = line.trim().split_whitespace();

        if let (Some(n1), Some(n2)) = (split_line.next(), split_line.next()) {
            if let (Ok(num1), Ok(num2)) = (n1.parse::<i32>(), n2.parse::<i32>()) {
                first_list.push(num1);
                second_list.push(num2);
            } else {
                eprintln!("Failed to parse numbers on line: {}", line)
            }
        } else {
            eprintln!("Malformed line: {}", line)
        }
    }
    (first_list, second_list)
}
