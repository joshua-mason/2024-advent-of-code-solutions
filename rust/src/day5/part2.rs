use std::{cmp::Ordering, collections::HashMap};

pub fn run() {
    let data = read_input_file();
    let count = process(&data);
    println!("Valid count: {}", count)
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day5.txt").expect("Failed to read input file 'day1.txt'")
}

struct PageOrderRule {
    page_before: usize,
    page_after: usize,
}

fn process(data: &str) -> usize {
    let rules_hmap = build_rules_map(data);
    let books = parse_books(data);
    let mut passing_books = vec![];
    let mut failing_books = vec![];

    // this is a mess, should be separated into some more functions...
    // also using loop labels is interesting, I doubt it is considered
    // idiomatic rust!
    'outer: for book in books {
        for (idx, page) in book.iter().enumerate() {
            let previous_pages = &book[..idx];
            for previous_page in previous_pages {
                let page_rules = rules_hmap.get(page);
                if let Some(page_rules) = page_rules {
                    let m: Option<&usize> = page_rules.iter().find(|rule| {
                        if *rule == previous_page {
                            return true;
                        }
                        return false;
                    });
                    if let Some(m) = m {
                        failing_books.push(book.clone());
                        continue 'outer;
                    }
                }
            }
        }
        passing_books.push(book.clone());
    }

    failing_books.iter_mut().for_each(|book| {
        book.sort_by(|a, b| {
            if let Some(rules) = rules_hmap.get(b) {
                if rules.contains(a) {
                    Ordering::Less
                } else {
                    Ordering::Greater
                }
            } else {
                Ordering::Greater
            }
        })
    });

    failing_books.iter().fold(0, |acc, arr| {
        let mid_value = arr[arr.len() / 2];
        acc + mid_value
    })
}

fn build_rules_map(data: &str) -> HashMap<usize, Vec<usize>> {
    let rule_data: &str = data.split("\n\n").next().expect("Invalid data");
    let mut rules_hmap: HashMap<usize, Vec<usize>> = HashMap::new();
    let parsed_rules = rule_data.split("\n").map(|rule_str| {
        let mut rule_pages = rule_str.split("|");
        PageOrderRule {
            page_before: rule_pages
                .next()
                .expect("Invalid data")
                .parse::<usize>()
                .expect("Invalid data"),
            page_after: rule_pages
                .next()
                .expect("Invalid data")
                .parse::<usize>()
                .expect("Invalid data"),
        }
    });

    for rule in parsed_rules {
        let existing_rules = rules_hmap.get(&rule.page_before);
        if let Some(rules) = existing_rules {
            let mut vec = rules.clone();
            vec.push(rule.page_after);
            rules_hmap.insert(rule.page_before, vec);
        } else {
            rules_hmap.insert(rule.page_before, vec![rule.page_after]);
        }
    }
    rules_hmap
}

fn parse_books(data: &str) -> Vec<Vec<usize>> {
    let books_data: &str = data.split("\n\n").skip(1).next().expect("Invalid data");
    books_data
        .split("\n")
        .map(|book_str| {
            book_str
                .split(",")
                .map(|page_str| page_str.parse::<usize>().expect("Invalid data"))
                .collect()
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_run() {
        let test_data = "47|53
97|13
97|61
97|47
75|29
61|13
75|53
29|13
97|29
53|29
61|53
97|53
61|29
47|13
75|47
97|75
47|61
75|61
47|29
75|13
53|13

75,47,61,53,29
97,61,53,29,13
75,29,13
75,97,47,61,53
61,13,29
97,13,75,29,47";
        let valid_pages_count = process(test_data);

        assert_eq!(valid_pages_count, 123);
    }
}
