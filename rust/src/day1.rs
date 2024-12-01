use std::iter::zip;

pub fn run() {
    let data = read_input_file();

    println!("Day 1 solution not implemented yet!");

    let (mut first_list, mut second_list) = read_lines_to_integer_lists(&data);

    sort_lists(&mut first_list, &mut second_list);

    let sum_of_differences = calculate_sum_of_differences(first_list, second_list);

    println!("Sum of differences: {}", sum_of_differences);
}

fn calculate_sum_of_differences(first_list: Vec<i32>, second_list: Vec<i32>) -> i32 {
    let zipped_lists = zip(first_list, second_list);
    let mut diff = 0;

    for pair in zipped_lists {
        diff = diff + (pair.0 - pair.1).abs();
    }
    diff
}

fn sort_lists(first_list: &mut Vec<i32>, second_list: &mut Vec<i32>) {
    first_list.sort();
    second_list.sort();
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day1.txt").unwrap()
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
                println!("Failed to parse numbers on line: {}", line)
            }
        } else {
            println!("Malformed line: {}", line)
        }
    }
    (first_list, second_list)
}
