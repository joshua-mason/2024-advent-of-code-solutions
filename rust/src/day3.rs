use lazy_static::lazy_static;
use regex::Regex;
use std::fs;

lazy_static! {
    static ref MUL_REGEX: Regex = Regex::new(r"mul\(([0-9]{1,3}),([0-9]{1,3})\)").unwrap();
}

pub fn run() {
    let data = read_input_file();
    let re = build_regex();
    let multiplication_pairs = match_all_multiplications(re, &data);
    let sum = aggregate_multiplied_pairs(multiplication_pairs);
    println!("{}", sum)
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

fn build_regex() -> &'static Regex {
    &MUL_REGEX
}

fn match_all_multiplications(re: &Regex, data: &str) -> Vec<[i32; 2]> {
    let mut multiplication_pairs: Vec<[i32; 2]> = vec![];
    for matched_mul in re.captures_iter(data) {
        let (_, [n1, n2]) = matched_mul.extract();
        if let (Ok(n1), Ok(n2)) = (n1.parse::<i32>(), n2.parse::<i32>()) {
            multiplication_pairs.push([n1, n2]);
        }
    }
    multiplication_pairs
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_match_multiplications() {
        let input = "xmul(2,4)%&mul[3,7]!@^do_not_mul(5,5)+mul(32,64]then(mul(11,8)mul(8,5))";
        let re = build_regex();
        let multiplication_pairs = match_all_multiplications(re, input);

        assert_eq!(multiplication_pairs, vec![[2, 4], [5, 5], [11, 8], [8, 5]])
    }
}
