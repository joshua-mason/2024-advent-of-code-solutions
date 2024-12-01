pub fn run() {
    let data = read_input_file();

    println!("Day 1 solution not implemented yet!");

    let (first_list, second_list) = read_lines_to_integer_lists(data);
    println!("{:?}", first_list);
    println!("{:?}", second_list);
}

fn read_input_file() -> String {
    let data = std::fs::read_to_string("./inputs/day1.txt").unwrap();
    data
}

fn read_lines_to_integer_lists(data: String) -> (Vec<i32>, Vec<i32>) {
    let lines = data.split("\n");
    let mut first_list: Vec<i32> = vec![];
    let mut second_list: Vec<i32> = vec![];

    for line in lines {
        let mut split_line = line.split_whitespace();
        let number_one_str = split_line.next();
        let number_two_str = split_line.next();

        let number_one = number_one_str.unwrap().parse::<i32>().unwrap();
        let number_two = number_two_str.unwrap().parse::<i32>().unwrap();

        first_list.push(number_one);
        second_list.push(number_two);
    }
    (first_list, second_list)
}
