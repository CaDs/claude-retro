export const fantasy = {
  id: 'fantasy',
  name: 'Fantasy Medieval',
  description: 'Swords, sorcery, taverns and dungeons',

  palettes: {
    tavern_warm: {
      black: '#000000', dark_brown: '#3a1a00', brown: '#5a3a15', tan: '#8a6a3a',
      amber: '#c89922', dark_red: '#8b2500', red: '#cc4411', orange: '#dd7722',
      yellow: '#ffcc44', dark_gray: '#444444', gray: '#777777', light_gray: '#aaaaaa',
      dark_blue: '#1a1a3a', white: '#e8e0d0', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    village_day: {
      black: '#000000', dark_brown: '#3a2a15', brown: '#6a4a2a', tan: '#9a7a5a',
      dark_blue: '#223366', blue: '#4477aa', light_blue: '#88aadd', white: '#e8e8e8',
      dark_green: '#1a4a1a', green: '#3a7a3a', dark_gray: '#555555', gray: '#888888',
      red: '#aa3333', yellow: '#ccaa33', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    forest_deep: {
      black: '#000000', dark_green: '#0f2a0f', green: '#1a5a1a', light_green: '#3a8a3a',
      dark_brown: '#2a1a0a', brown: '#5a3a15', tan: '#8a6a3a', dark_blue: '#1a2a4a',
      blue: '#4477aa', dark_gray: '#444444', gray: '#777777', red: '#cc4444',
      yellow: '#ddcc44', white: '#ddddcc', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    temple_mystic: {
      black: '#000000', deep_blue: '#0a0a2a', dark_purple: '#1a1040', purple: '#2a1855',
      dark_stone: '#2a2a3a', stone: '#4a4a5a', light_stone: '#6a6a7a', pale_stone: '#8a8a9a',
      dark_gold: '#7a5a10', gold: '#c89922', bright_gold: '#ffcc44', dark_teal: '#0a3a3a',
      teal: '#2a6a6a', vine_green: '#2a5a2a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    dungeon_dark: {
      black: '#000000', dark_gray: '#1a1a1a', gray: '#3a3a3a', light_gray: '#5a5a5a',
      brown: '#4a3a2a', dark_brown: '#2a1a0a', tan: '#6a5a4a', dark_red: '#4a1010',
      red: '#8a2020', orange: '#aa5522', yellow: '#ccaa33', dark_blue: '#0a0a2a',
      blue: '#2a2a5a', green: '#1a3a1a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    castle_grand: {
      black: '#000000', dark_gray: '#2a2a2a', gray: '#5a5a5a', light_gray: '#8a8a8a',
      white: '#cccccc', dark_brown: '#3a2a1a', brown: '#6a4a2a', tan: '#9a7a5a',
      dark_red: '#5a1a1a', red: '#8a2a2a', gold: '#c89922', dark_blue: '#1a1a4a',
      blue: '#3a3a7a', purple: '#4a2a6a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
  },

  templates: [
    'fantasy/tavern', 'fantasy/village_square', 'fantasy/forest_path', 'fantasy/temple_ruins',
    'fantasy/castle_hall', 'fantasy/dungeon_cell', 'fantasy/market_square', 'fantasy/cave_entrance',
  ],

  props: [
    'barrel', 'table', 'chair', 'torch_sconce', 'cauldron', 'chest', 'banner',
    'throne', 'well', 'cart', 'statue', 'bookshelf', 'rug', 'crate', 'lamp',
  ],

  characterTraits: {
    clothing: ['tunic', 'apron', 'robe', 'armor', 'vest', 'cloak', 'dress', 'merchant_garb'],
    accessory: ['hood', 'hat', 'headband', 'eyepatch', 'glasses', 'crown', 'none', 'helmet', 'circlet'],
    footwear: ['boots', 'shoes', 'sandals', 'none', 'armored_boots'],
  },

  itemIcons: [
    'weapon_sword', 'weapon_dagger', 'weapon_staff', 'potion', 'scroll',
    'key', 'coin', 'gem', 'ring', 'book', 'rope', 'lantern', 'food', 'drink',
  ],
};
