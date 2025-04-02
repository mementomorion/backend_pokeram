CREATE DATABASE texas_holdem;

\c texas_holdem;

-- Table for storing users
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    balance INTEGER NOT NULL DEFAULT 10000
);

-- Table for storing rooms
CREATE TABLE rooms (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    player_count INTEGER NOT NULL DEFAULT 0,
    max_players INTEGER NOT NULL,
    small_blind INTEGER NOT NULL,
    big_blind INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'waiting'
);

-- Table for storing game states
CREATE TABLE game_states (
    id UUID PRIMARY KEY,
    room_id UUID REFERENCES rooms(id),
    state JSONB NOT NULL
);

-- Insert initial rooms
INSERT INTO rooms (id, name, player_count, max_players, small_blind, big_blind, status) VALUES
(uuid_generate_v4(), 'High Rollers', 0, 6, 10, 20, 'waiting'),
(uuid_generate_v4(), 'Big League', 0, 9, 50, 100, 'waiting');