use lazy_static::lazy_static;
use regex::Regex;
use std::fs;

lazy_static! {
    static ref MUL_REGEX: Regex = Regex::new(r"mul\(([0-9]{1,3}),([0-9]{1,3})\)").unwrap();
    static ref COMMAND_REGEX: Regex =
        Regex::new(r"(mul)\([0-9]{1,3},[0-9]{1,3}\)|(do)\(\)|(don't)\(\)").unwrap();
}

pub fn run() {
    let data = read_input_file();
    let multiplication_pairs = match_all_multiplications(&MUL_REGEX, &data);
    let sum = aggregate_multiplied_pairs(multiplication_pairs);
    println!("{}", sum);

    let instructions = parse_instructions(&COMMAND_REGEX, &data);
    let sum = compute_instructions(instructions);
    println!("{}", sum);
}

fn aggregate_multiplied_pairs(multiplication_pairs: Vec<[i32; 2]>) -> i32 {
    let sum = multiplication_pairs
        .iter()
        .fold(0, |acc, [n1, n2]| acc + n1 * n2);
    sum
}

fn read_input_file() -> String {
    fs::read_to_string("./inputs/day3.txt").expect("Unable to find day3 data")
}

#[derive(PartialEq, Eq, Debug)]
enum Instruction {
    Mul(i32, i32),
    Do,
    Dont,
}

fn parse_instructions(re: &Regex, data: &str) -> Vec<Instruction> {
    re.captures_iter(data)
        .filter_map(|caps| {
            let (full, [command]) = caps.extract();
            match command {
                "do" => Some(Instruction::Do),
                "don't" => Some(Instruction::Dont),
                "mul" => {
                    let (_, [n1, n2]) = &MUL_REGEX.captures(full)?.extract();
                    Some(Instruction::Mul(
                        n1.parse::<i32>().ok()?,
                        n2.parse::<i32>().ok()?,
                    ))
                }
                _ => None,
            }
        })
        .collect()
}

fn compute_instructions(instructions: Vec<Instruction>) -> i32 {
    let mut enabled = true;
    instructions
        .iter()
        .filter_map(|i| match i {
            Instruction::Do => {
                enabled = true;
                None
            }
            Instruction::Dont => {
                enabled = false;
                None
            }
            Instruction::Mul(n1, n2) if enabled => Some(n1 * n2),
            _ => None,
        })
        .sum()
}

fn match_all_multiplications(re: &Regex, data: &str) -> Vec<[i32; 2]> {
    re.captures_iter(data)
        .filter_map(|caps| {
            let (_, [n1, n2]) = caps.extract();
            Some([n1.parse::<i32>().ok()?, n2.parse::<i32>().ok()?])
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_match_multiplications() {
        let input = "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
        let multiplication_pairs = match_all_multiplications(&MUL_REGEX, input);

        assert_eq!(multiplication_pairs, vec![[2, 4], [5, 5], [11, 8], [8, 5]])
    }

    #[test]
    fn test_aggregate_multiplied_pairs() {
        let input = vec![[1, 3], [10, 2]];
        let sum = aggregate_multiplied_pairs(input);

        assert_eq!(sum, 23)
    }

    #[test]
    fn test_parse_instructions() {
        let input = "xmul(2,4)&mul[3,7]!^don't()_mul(5,5)+mul(32,64](mul(11,8)undo()?mul(8,5))";

        let instructions = parse_instructions(&COMMAND_REGEX, input);

        assert_eq!(
            instructions,
            vec![
                Instruction::Mul(2, 4),
                Instruction::Dont,
                Instruction::Mul(5, 5),
                Instruction::Mul(11, 8),
                Instruction::Do,
                Instruction::Mul(8, 5)
            ]
        )
    }
    #[test]
    fn test_compute_instructions() {
        let input = vec![
            Instruction::Mul(2, 4),
            Instruction::Dont,
            Instruction::Mul(5, 5),
            Instruction::Mul(11, 8),
            Instruction::Do,
            Instruction::Mul(8, 5),
        ];

        let sum = compute_instructions(input);

        assert_eq!(sum, 48)
    }
}
