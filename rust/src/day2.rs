use std::{clone, collections::btree_map::Range, result};

pub fn run() {
    let input_file = read_input_file();
    let parsed_data = parse_data(&input_file);
    let safe_report_count = parsed_data.iter().filter(|report| is_safe(report)).count();
    let safe_report_count_with_dampener = parsed_data
        .iter()
        .filter(|report| validate_with_dampener(report))
        .count();
    println!("Safe report count: {}", safe_report_count);
    println!(
        "Safe report with dampener count: {}",
        safe_report_count_with_dampener
    );
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day2.txt").expect("Failed to read input file 'day2.txt'")
}

fn parse_data(input: &str) -> Vec<Vec<i32>> {
    input
        .lines()
        .map(|line| {
            line.split_whitespace()
                .filter_map(|number| number.parse::<i32>().ok())
                .collect::<Vec<i32>>()
        })
        .collect::<Vec<Vec<i32>>>()
}

fn is_safe(report: &[i32]) -> bool {
    let mut trending_up: Option<bool> = None;
    let mut safe = true;

    for window in report.windows(2) {
        if let [n1, n2] = window {
            let diff = n2 - n1;

            if diff.abs() > 3 || diff == 0 {
                safe = false;
            }
            let new_trending_up = diff > 0;

            if let Some(trending_up) = trending_up {
                if (trending_up != new_trending_up) {
                    safe = false
                }
            }

            trending_up = Some(new_trending_up);
        }
    }
    safe
}

fn validate_with_dampener(report: &[i32]) -> bool {
    for i in 0..report.len() {
        let modified: Vec<i32> = report
            .iter()
            .enumerate()
            .filter_map(|(idx, &val)| if idx != i { Some(val) } else { None })
            .collect();

        if is_safe(&modified) {
            return true;
        }
    }
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_data() {
        let input = "1 2 3 1 2\n9 2 3 4 111 3 43";

        let result = parse_data(input);

        assert_eq!(
            result,
            vec![vec![1, 2, 3, 1, 2], vec![9, 2, 3, 4, 111, 3, 43]]
        )
    }

    #[test]
    fn test_is_safe_basic_success() {
        let input = vec![1, 2, 3, 4];

        let result = is_safe(&input);

        assert_eq!(result, true);
    }

    #[test]
    fn test_is_safe_fail_double_number() {
        let input = vec![1, 2, 3, 3];

        let result = is_safe(&input);

        assert_eq!(result, false);
    }

    #[test]
    fn test_is_safe_fail_large_gap() {
        let input = vec![1, 2, 3, 8];

        let result = is_safe(&input);

        assert_eq!(result, false);
    }

    #[test]
    fn test_is_safe_fail_reverse() {
        let input = vec![1, 2, 3, 2];

        let result = is_safe(&input);

        assert_eq!(result, false);
    }

    #[test]
    fn test_is_safe_edge_cases() {
        assert!(is_safe(&[]));
        assert!(is_safe(&[5]));
        assert!(!is_safe(&[3, 3, 3, 3]));
        assert!(is_safe(&[1, 4, 7, 10]));
    }

    #[test]
    fn test_is_safe_with_dampener() {
        let input = vec![1, 2, 2, 4];

        let result = validate_with_dampener(&input);

        assert_eq!(result, true);
    }
}
