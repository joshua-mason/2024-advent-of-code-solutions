pub fn run() {
    let data = read_input_file();

    let mut word_search = parse_data_to_word_search(&data);
    let count = 0;
    println!("X-MAS count: {}", count)
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day4.txt").expect("Failed to read input file 'day1.txt'")
}

fn parse_data_to_word_search(data: &str) -> Vec<Vec<char>> {
    data.lines().map(|row| row.chars().collect()).collect()
}

#[cfg(test)]
mod tests {}
