export const scifi = {
  id: 'scifi',
  name: 'Science Fiction',
  description: 'Starships, colonies, alien worlds and high technology',

  palettes: {
    ship_bridge: {
      black: '#000000', dark_blue: '#0a0a2a', blue: '#1a2a5a', mid_blue: '#2a4a8a',
      light_blue: '#4a7acc', cyan: '#4aaacc', bright_cyan: '#66ddee', white: '#ddeeff',
      dark_gray: '#1a1a2a', gray: '#3a3a5a', light_gray: '#6a6a8a', pale_gray: '#9a9aaa',
      dark_teal: '#0a3a4a', orange: '#cc6622', yellow: '#cccc44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    colony_hub: {
      black: '#000000', dark_gray: '#2a2a2a', gray: '#5a5a5a', light_gray: '#8a8a8a',
      white: '#cccccc', dark_green: '#1a3a1a', green: '#3a6a3a', light_green: '#6aaa6a',
      dark_brown: '#3a2a1a', brown: '#6a4a2a', tan: '#9a7a5a', dark_blue: '#1a2a4a',
      blue: '#3a5a8a', orange: '#cc7733', yellow: '#ccaa44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    corridor_dark: {
      black: '#000000', dark_blue: '#0a0a1a', blue: '#1a1a3a', mid_blue: '#2a2a5a',
      dark_gray: '#1a1a1a', gray: '#3a3a3a', light_gray: '#5a5a5a', pale_gray: '#7a7a7a',
      dark_red: '#4a0a0a', red: '#8a1a1a', orange: '#aa4422', dark_teal: '#0a2a2a',
      teal: '#1a4a4a', yellow: '#aaaa33', white: '#aaaaaa', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    lab_bright: {
      black: '#000000', white: '#eeeeff', off_white: '#ccccdd', pale_blue: '#aabbdd',
      light_teal: '#88cccc', teal: '#44aaaa', dark_teal: '#227777', dark_blue: '#1a2a4a',
      light_gray: '#aaaaaa', gray: '#777777', dark_gray: '#444444', green: '#44aa44',
      light_green: '#88dd88', orange: '#dd8833', yellow: '#dddd44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    alien_planet: {
      black: '#000000', deep_purple: '#1a0a2a', dark_purple: '#2a1a4a', purple: '#4a2a7a',
      light_purple: '#7a4aaa', magenta: '#aa3a8a', dark_green: '#0a3a1a', green: '#2a7a3a',
      light_green: '#5aaa5a', bright_green: '#88dd66', dark_brown: '#2a1a0a', brown: '#5a3a15',
      orange: '#cc6622', yellow: '#ddcc33', white: '#cccccc', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
  },

  templates: [
    'scifi/ship_bridge', 'scifi/colony_hub', 'scifi/corridor', 'scifi/cargo_bay',
    'scifi/lab_interior', 'scifi/alien_planet', 'scifi/cantina', 'scifi/engine_room',
  ],

  props: [
    'console', 'terminal', 'pipe', 'vent', 'hologram', 'reactor', 'antenna',
    'pod', 'crate', 'lamp', 'table', 'chair',
  ],

  characterTraits: {
    clothing: ['jumpsuit', 'uniform', 'labcoat', 'spacesuit', 'tunic', 'vest', 'robe', 'armor'],
    accessory: ['visor', 'headset', 'goggles', 'helmet', 'none', 'eyepatch', 'circlet', 'glasses'],
    footwear: ['boots', 'mag_boots', 'shoes', 'sandals', 'none'],
  },

  itemIcons: [
    'weapon_blaster', 'weapon_phaser', 'keycard', 'datapad', 'medkit',
    'circuit', 'power_cell', 'food', 'drink', 'tool',
  ],
};
