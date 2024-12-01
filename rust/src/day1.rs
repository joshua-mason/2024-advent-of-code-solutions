pub fn run() {
    let data = read_input_file();

    println!("Day 1 solution not implemented yet!");

    let (first_list, second_list) = read_lines_to_integer_lists(&data);
    println!("{:?}", first_list);
    println!("{:?}", second_list);
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
