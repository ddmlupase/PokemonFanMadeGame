// src/data/pokemonData.js

export const pokemonData = [
  {
    id: 'pikachu',
    name: 'Pikachu',
    type: 'Electric',
    images: {
      // For character selection screen
      selection: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_5b2_025_m.png',
      // For game screen - when this pokemon is player 1 (facing right/away)
      player1: 'https://archives.bulbagarden.net/media/upload/5/57/Spr_b_5b_025_f.png',
      // For game screen - when this pokemon is player 2/opponent (facing left/front)
      player2: 'https://archives.bulbagarden.net/media/upload/2/2b/Spr_5b2_025_m.png',
      // Alternative high-res images (you can replace these with your custom images)
      // player1: '/images/pokemon/pikachu-back.png',
      // player2: '/images/pokemon/pikachu-front.png',
    },
    stats: {
      power: 92,
      skills: 70,
      intelligence: 86,
      physical: 95,
      magic: 99
    },
    attacks: [
      { name: 'lightning bolt', damage: 35, type: 'electric' },
      { name: 'punch', damage: 25, type: 'normal' },
      { name: 'strike', damage: 30, type: 'normal' },
      { name: 'kick', damage: 28, type: 'fighting' },
      { name: 'run', damage: 0, type: 'escape' }
    ],
    description: "A mouse-like Pokémon with electrical abilities."
  },
  {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    type: 'Grass/Poison',
    images: {
      selection: 'https://archives.bulbagarden.net/media/upload/7/76/Spr_5b_001.png',
      player1: 'https://archives.bulbagarden.net/media/upload/e/e9/Spr_b_5b_001.png',
      player2: 'https://archives.bulbagarden.net/media/upload/7/76/Spr_5b_001.png',
    },
    stats: {
      power: 88,
      skills: 75,
      intelligence: 82,
      physical: 89,
      magic: 92
    },
    attacks: [
      { name: 'vine whip', damage: 32, type: 'grass' },
      { name: 'tackle', damage: 28, type: 'normal' },
      { name: 'razor leaf', damage: 38, type: 'grass' },
      { name: 'slam', damage: 30, type: 'normal' },
      { name: 'dodge', damage: 0, type: 'defense' }
    ],
    description: "A grass-type Pokémon with a plant bulb on its back."
  },
  {
    id: 'charmander',
    name: 'Charmander',
    type: 'Fire',
    images: {
      selection: 'https://archives.bulbagarden.net/media/upload/0/0a/Spr_5b_004.png',
      player1: 'https://archives.bulbagarden.net/media/upload/5/54/Spr_b_5b_004.png',
      player2: 'https://archives.bulbagarden.net/media/upload/0/0a/Spr_5b_004.png',
    },
    stats: {
      power: 90,
      skills: 68,
      intelligence: 78,
      physical: 93,
      magic: 96
    },
    attacks: [
      { name: 'flame burst', damage: 40, type: 'fire' },
      { name: 'scratch', damage: 26, type: 'normal' },
      { name: 'bite', damage: 29, type: 'dark' },
      { name: 'tail whip', damage: 0, type: 'status' },
      { name: 'run', damage: 0, type: 'escape' }
    ],
    description: "A fire-type lizard Pokémon with a flame on its tail."
  },
  {
    id: 'squirtle',
    name: 'Squirtle',
    type: 'Water',
    images: {
      selection: 'https://archives.bulbagarden.net/media/upload/5/59/Spr_5b_007.png',
      player1: 'https://archives.bulbagarden.net/media/upload/3/3d/Spr_b_5b_007.png',
      player2: 'https://archives.bulbagarden.net/media/upload/5/59/Spr_5b_007.png',
    },
    stats: {
      power: 85,
      skills: 72,
      intelligence: 80,
      physical: 91,
      magic: 88
    },
    attacks: [
      { name: 'water gun', damage: 34, type: 'water' },
      { name: 'tackle', damage: 28, type: 'normal' },
      { name: 'bite', damage: 29, type: 'dark' },
      { name: 'shell defense', damage: 0, type: 'defense' },
      { name: 'retreat', damage: 0, type: 'escape' }
    ],
    description: "A water-type turtle Pokémon that can withdraw into its shell."
  }
];

// Helper functions for easy access
export const getPokemonById = (id) => {
  return pokemonData.find(pokemon => pokemon.id === id);
};

export const getPokemonByName = (name) => {
  return pokemonData.find(pokemon => pokemon.name.toLowerCase() === name.toLowerCase());
};

export const getAllPokemonNames = () => {
  return pokemonData.map(pokemon => pokemon.name);
};

// If you want to add more pokemon later, just add them to the pokemonData array
// Example of how to add a new pokemon:
/*
{
  id: 'pikachu_shiny',
  name: 'Shiny Pikachu',
  type: 'Electric',
  images: {
    selection: '/images/pokemon/pikachu_shiny_selection.png',
    player1: '/images/pokemon/pikachu_shiny_back.png',
    player2: '/images/pokemon/pikachu_shiny_front.png',
  },
  stats: {
    power: 95,
    skills: 72,
    intelligence: 88,
    physical: 97,
    magic: 101
  },
  attacks: [
    { name: 'thunder', damage: 45, type: 'electric' },
    { name: 'quick attack', damage: 22, type: 'normal' },
    { name: 'double kick', damage: 32, type: 'fighting' },
    { name: 'agility', damage: 0, type: 'status' },
    { name: 'run', damage: 0, type: 'escape' }
  ],
  description: "A rare, golden-colored Pikachu with enhanced abilities."
}
*/