use std::{fmt::Debug, fs};

pub fn run() {
    let data = read_input_file();

    let mut word_search = parse_data_to_word_search(&data);

    let mut count = 0;

    // rows + reverse rows
    count += count_occurrences_in_lines(&word_search);
    count += count_occurrences_in_lines(&reverse(&word_search));

    let transposed_word_search = transpose(&word_search);

    // cols + reverse cols
    count += count_occurrences_in_lines(&transposed_word_search);
    count += count_occurrences_in_lines(&reverse(&transposed_word_search));

    // diagonals + reverse diagonals
    for i in 0..4 {
        let mut down_diagonal_strings = extract_diagonal_strings(&word_search);
        if i > 1 {
            let _ = down_diagonal_strings.remove(0);
        }
        count += count_occurrences_in_lines(&down_diagonal_strings);
        count += count_occurrences_in_lines(&reverse(&down_diagonal_strings));

        word_search = rotate(&word_search);
    }

    println!("XMAS count: {}", count)
}

fn count_occurrences_in_lines(word_search: &Vec<Vec<char>>) -> usize {
    word_search.iter().fold(0, |acc, row| {
        let line = row.iter().collect::<String>();
        acc + count_words(&line, "XMAS")
    })
}

fn reverse(word_search: &Vec<Vec<char>>) -> Vec<Vec<char>> {
    word_search
        .iter()
        .map(|line| line.iter().rev().copied().collect::<Vec<char>>())
        .collect::<Vec<Vec<char>>>()
}

fn parse_data_to_word_search(data: &str) -> Vec<Vec<char>> {
    data.lines().map(|row| row.chars().collect()).collect()
}

fn read_input_file() -> String {
    fs::read_to_string("./inputs/day4.txt").expect("Unable to find day3 data")
}

fn count_words(line: &str, pattern: &str) -> usize {
    let window = pattern.len();

    let chars: Vec<char> = line.chars().collect();

    chars
        .windows(window)
        .filter(|char_window| char_window == &pattern.chars().collect::<Vec<_>>().as_slice())
        .count()
}

fn transpose<T>(word_search: &[Vec<T>]) -> Vec<Vec<T>>
where
    T: Copy,
{
    let line_length = word_search[0].len();

    let mut new_word_search: Vec<Vec<T>> = (0..line_length).map(|_| Vec::new()).collect();
    for col_idx in 0..line_length {
        for row in word_search.iter() {
            new_word_search[col_idx].push(row[col_idx]);
        }
    }

    new_word_search
}

fn rotate<T>(word_search: &[Vec<T>]) -> Vec<Vec<T>>
where
    T: Copy,
{
    word_search
        .iter()
        .enumerate()
        .map(|(idx, _)| word_search.iter().map(|row| row[idx]).rev().collect())
        .collect()
}

fn extract_diagonal_strings<T>(word_search: &[Vec<T>]) -> Vec<Vec<T>>
where
    T: Copy + Debug,
{
    let max_idx = word_search.iter().count();
    let mut diagonal_offset = 0;
    let mut output = vec![];

    word_search.iter().enumerate().for_each(|(row_idx, _)| {
        let mut diagonal: Vec<T> = vec![];
        word_search[0].iter().enumerate().for_each(|(col_idx, _)| {
            let (diag_row, diag_col) = (row_idx + col_idx, row_idx + col_idx - diagonal_offset);
            if diag_row >= max_idx || diag_col >= max_idx {
                return;
            }
            let value = word_search[diag_row][diag_col];
            diagonal.push(value);
        });
        diagonal_offset += 1;
        output.push(diagonal)
    });
    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_words() {
        let input = "XXMASSSSM";
        let count = count_words(input, "XMAS");
        assert_eq!(count, 1);
    }

    #[test]
    fn test_multiple_occurrences() {
        let input = "SXXSAMSSMMSMMSXXXXMMXMMMMSMMMSSSXSAMXMXSXMASXMSMXSMMXSMSXMMASXMASMSSMMXSMSSSSSSXSXMAMXAMXSMSXSXXMMMMMXXMSSMMSXSASASMMSXMASXSSSSSMXMASMSMXAMX";
        let count = count_words(input, "XMAS");
        assert_eq!(count, 4);
    }

    #[test]
    fn test_no_match() {
        let input = "XXXX";
        let count = count_words(input, "XMAS");
        assert_eq!(count, 0);
    }

    #[test]
    fn test_transpose() {
        let input = vec![vec!["A", "B"], vec!["C", "D"]];
        let transposed = transpose(&input);
        assert_eq!(transposed, vec![vec!["A", "C"], vec!["B", "D"]])
    }

    #[test]
    fn test_rotate() {
        let input = vec![vec!["A", "B"], vec!["C", "D"]];
        let rotated = rotate(&input);
        assert_eq!(rotated, vec![vec!["C", "A"], vec!["D", "B"]])
    }

    #[test]
    fn test_rotate_three_by_three() {
        let input = vec![
            vec!["A", "B", "C"],
            vec!["D", "E", "F"],
            vec!["G", "H", "I"],
        ];
        let rotated = rotate(&input);
        assert_eq!(
            rotated,
            vec![
                vec!["G", "D", "A"],
                vec!["H", "E", "B"],
                vec!["I", "F", "C"]
            ]
        );
    }

    #[test]
    fn test_extract_diagonal_strings_down() {
        let input = vec![vec!["A", "B"], vec!["C", "D"]];
        let diagonals = extract_diagonal_strings(&input);
        assert_eq!(diagonals, vec![vec!["A", "D"], vec!["C"]])
    }
}
