use std::cmp::Ordering;

#[derive(PartialEq, Debug)]
enum Operator {
    And,
    Or,
    Xor,
}

#[derive(PartialEq, Debug)]
struct Gate<'a> {
    left: &'a str,
    right: &'a str,
    out: &'a str,
    operator: Operator,
}

#[derive(PartialEq, Debug)]
struct HeldValue<'a> {
    key: &'a str,
    value: i32,
}

pub fn run() {
    let input_file = read_input_file();
    let (mut held_values, mut gates) = parse_input(&input_file);

    loop {
        println!("total held values: {:?}", held_values.len());
        let (new_held_values, operated, used_gate_index) = process_next_gate(&gates, held_values);
        if used_gate_index >= 0 {
            gates.remove(used_gate_index as usize);
        }
        held_values = new_held_values;
        if !operated {
            break;
        }
    }
    held_values.retain(|held_value| held_value.key.contains("z"));
    let output_number = binary_from_held_values(held_values);

    println!("{:?}", output_number);
}

fn binary_from_held_values(mut held_values: Vec<HeldValue<'_>>) -> u64 {
    held_values.sort_by(|a, b| {
        if a.key > b.key {
            Ordering::Greater
        } else {
            Ordering::Less
        }
    });
    held_values.reverse();
    let binary_string = held_values
        .iter()
        .map(|held_value| held_value.value.to_string())
        .collect::<Vec<String>>()
        .join("");
    let mut binary_prefix = "0b".to_owned();
    binary_prefix.push_str(&binary_string);
    println!("{:?}", binary_string);
    let out = u64::from_str_radix(&binary_string, 2).unwrap();
    out
}

fn process_next_gate<'a>(
    gates: &Vec<Gate<'a>>,
    mut held_values: Vec<HeldValue<'a>>,
) -> (Vec<HeldValue<'a>>, bool, i32) {
    let held_value_keys: Vec<&str> = held_values
        .iter()
        .map(|held_value| held_value.key)
        .collect();
    let mut possible_gate_to_operate: Option<&Gate> = None;
    let mut gate_position = -1;
    for (idx, gate) in gates.iter().enumerate() {
        if held_value_keys.contains(&gate.left) && held_value_keys.contains(&gate.right) {
            possible_gate_to_operate = Some(gate);
            gate_position = idx as i32;
            break;
        }
    }

    if (possible_gate_to_operate == None) {
        return (held_values, false, -1);
    }
    let gate_to_operate = possible_gate_to_operate.unwrap();
    println!("operating on gate (out = {:?})", gate_to_operate.out);

    let right_held_index = &held_values
        .iter()
        .position(|held_value| held_value.key == gate_to_operate.right)
        .expect("Could not locate right");

    let left_held_index = &held_values
        .iter()
        .position(|held_value| held_value.key == gate_to_operate.left)
        .expect("Could not locate left");

    let right_held_value = held_values
        .iter()
        .nth(*right_held_index)
        .expect("No right value");
    let left_held_value = held_values
        .iter()
        .nth(*left_held_index)
        .expect("No left value");

    let new_held_value: HeldValue =
        process_gate(gate_to_operate, left_held_value, right_held_value);

    held_values.push(new_held_value);

    (held_values, true, gate_position)
}

fn process_gate<'a>(
    gate_to_operate: &Gate<'a>,
    left_held_value: &HeldValue<'a>,
    right_held_value: &HeldValue<'a>,
) -> HeldValue<'a> {
    let value = match gate_to_operate.operator {
        Operator::And => left_held_value.value & right_held_value.value,
        Operator::Or => left_held_value.value | right_held_value.value,
        Operator::Xor => left_held_value.value ^ right_held_value.value,
    };
    HeldValue {
        key: &gate_to_operate.out,
        value,
    }
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day24.txt").expect("Failed to read input file 'day1.txt'")
}

fn parse_input(input_data: &str) -> (Vec<HeldValue>, Vec<Gate>) {
    let mut split_data = input_data.split("\n\n");
    let held_values_str = split_data.next().expect("Invalid input");
    let gates_str: &str = split_data.next().expect("Invalid input");

    let held_values: Vec<HeldValue> = held_values_str
        .lines()
        .map(|line| {
            let mut split_line = line.split(": ");
            let name = split_line.next().expect("Invalid data");
            let value = split_line.next().expect("Invalid data");
            HeldValue {
                key: &name,
                value: value.parse::<i32>().expect("Invalid data"),
            }
        })
        .collect();
    let gates: Vec<Gate> = gates_str
        .lines()
        .map(|line| {
            let mut split_line = line.split(" ");
            let (left, right, out, operator) = {
                let left = split_line.next().expect("Invalid data");
                let operator_str = split_line.next().expect("Invalid data");
                let right = split_line.next().expect("Invalid data");
                let _ = split_line.next().expect("Invalid data");
                let out = split_line.next().expect("Invalid data");

                let operator = match operator_str {
                    "AND" => Operator::And,
                    "OR" => Operator::Or,
                    "XOR" => Operator::Xor,
                    _ => panic!("Invalid data"),
                };

                (left, right, out, operator)
            };

            Gate {
                left: left,
                right: right,
                out: out,
                operator: operator,
            }
        })
        .collect();
    (held_values, gates)
}
