use std::collections::HashMap;

pub fn run() {
    let data = read_input_file();

    let mut word_search = parse_data_to_word_search(&data);

    let hmap = build_hash_map(&word_search);

    let m_positions = get_m_coords(&word_search);

    let count = count_valid_crosses(&m_positions, &hmap);

    println!("X-MAS count: {}", count)
}

fn read_input_file() -> String {
    std::fs::read_to_string("./inputs/day4.txt").expect("Failed to read input file 'day1.txt'")
}

fn parse_data_to_word_search(data: &str) -> Vec<Vec<char>> {
    data.lines().map(|row| row.chars().collect()).collect()
}

#[derive(Debug, Eq, PartialEq, Hash)]
struct TileCoord {
    x: usize,
    y: usize,
}

#[derive(Debug, Eq, PartialEq)]
enum TileValue {
    X,
    M,
    A,
    S,
}

fn build_hash_map(word_search: &[Vec<char>]) -> HashMap<TileCoord, TileValue> {
    let mut hmap = HashMap::new();

    word_search.iter().enumerate().for_each(|(row_idx, row)| {
        row.iter().enumerate().for_each(|(col_idx, character)| {
            let tile_value = match character {
                'X' => TileValue::X,
                'M' => TileValue::M,
                'A' => TileValue::A,
                'S' => TileValue::S,
                _ => panic!("Did not recognise character {character}"),
            };
            hmap.insert(
                TileCoord {
                    x: col_idx,
                    y: row_idx,
                },
                tile_value,
            );
        })
    });
    return hmap;
}
fn get_m_coords(word_search: &[Vec<char>]) -> Vec<TileCoord> {
    word_search
        .iter()
        .enumerate()
        .flat_map(|(row_idx, row)| {
            row.iter()
                .enumerate()
                .filter_map(move |(col_idx, &character)| {
                    if character == 'A' {
                        Some(TileCoord {
                            x: col_idx,
                            y: row_idx,
                        })
                    } else {
                        None
                    }
                })
        })
        .collect()
}
fn count_valid_crosses(positions: &Vec<TileCoord>, hmap: &HashMap<TileCoord, TileValue>) -> usize {
    positions
        .iter()
        .map(|position| validate_cross(&position, hmap))
        .filter(|is_valid| match is_valid {
            Some(is_valid) => *is_valid,
            None => false,
        })
        .count()
}

fn validate_cross(position: &TileCoord, hmap: &HashMap<TileCoord, TileValue>) -> Option<bool> {
    if (position.x == 0 || position.y == 0) {
        return None;
    }
    let top_left = TileCoord {
        x: position.x - 1,
        y: position.y - 1,
    };

    let top_right = TileCoord {
        x: position.x + 1,
        y: position.y - 1,
    };

    let bottom_left = TileCoord {
        x: position.x - 1,
        y: position.y + 1,
    };

    let bottom_right = TileCoord {
        x: position.x + 1,
        y: position.y + 1,
    };

    let top_left_tile = hmap.get(&top_left)?;
    let top_right_tile = hmap.get(&top_right)?;
    let bottom_left_tile = hmap.get(&bottom_left)?;
    let bottom_right_tile = hmap.get(&bottom_right)?;

    if ((top_left_tile == &TileValue::M && bottom_right_tile == &TileValue::S
        || top_left_tile == &TileValue::S && bottom_right_tile == &TileValue::M)
        && (top_right_tile == &TileValue::M && bottom_left_tile == &TileValue::S
            || top_right_tile == &TileValue::S && bottom_left_tile == &TileValue::M))
    {
        Some(true)
    } else {
        Some(false)
    }
}
#[cfg(test)]
mod tests {}
