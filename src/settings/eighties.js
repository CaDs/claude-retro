export const eighties = {
  id: 'eighties',
  name: '1980s Retro',
  description: 'Arcades, malls, neon lights and cassette tapes',

  palettes: {
    arcade_neon: {
      black: '#000000', dark_blue: '#0a0a2a', blue: '#1a1a5a', bright_blue: '#3a3aaa',
      dark_purple: '#2a0a3a', purple: '#5a1a7a', magenta: '#aa2a8a', hot_pink: '#dd44aa',
      dark_cyan: '#0a3a4a', cyan: '#22aacc', bright_cyan: '#44ddee', dark_gray: '#2a2a2a',
      gray: '#5a5a5a', yellow: '#dddd33', green: '#33dd33', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    mall_bright: {
      black: '#000000', white: '#eeeee8', off_white: '#cccccc', pale_pink: '#ddaaaa',
      light_gray: '#aaaaaa', gray: '#777777', dark_gray: '#444444', dark_blue: '#2a3a6a',
      blue: '#4a6aaa', pink: '#cc6688', tan: '#bbaa88', brown: '#7a5a3a',
      red: '#cc3344', yellow: '#ddcc44', green: '#44aa66', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    suburban_warm: {
      black: '#000000', dark_brown: '#3a2a15', brown: '#6a4a2a', tan: '#9a7a5a',
      beige: '#ccaa88', off_white: '#ddddcc', white: '#eeeee0', dark_green: '#1a4a1a',
      green: '#3a7a3a', light_green: '#6aaa6a', dark_blue: '#223366', blue: '#4477aa',
      light_blue: '#88aadd', dark_gray: '#4a4a4a', gray: '#7a7a7a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    record_store_dark: {
      black: '#000000', dark_gray: '#1a1a1a', gray: '#3a3a3a', mid_gray: '#5a5a5a',
      light_gray: '#7a7a7a', dark_brown: '#2a1a0a', brown: '#5a3a15', tan: '#8a6a3a',
      dark_red: '#5a1a1a', red: '#aa2a2a', orange: '#cc6633', yellow: '#ccaa33',
      dark_purple: '#2a1a3a', purple: '#5a3a7a', white: '#bbbbbb', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    diner_warm: {
      black: '#000000', dark_red: '#5a1a1a', red: '#aa3333', bright_red: '#dd4444',
      dark_brown: '#3a1a00', brown: '#5a3a15', tan: '#8a6a3a', cream: '#ddd8bb',
      white: '#eeeee8', dark_teal: '#0a4a4a', teal: '#2a7a7a', light_teal: '#4aaaaa',
      dark_gray: '#3a3a3a', gray: '#6a6a6a', yellow: '#ddcc44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
  },

  templates: [
    'eighties/arcade', 'eighties/mall_interior', 'eighties/suburban_street', 'eighties/record_store',
    'eighties/diner', 'eighties/video_store', 'eighties/high_school', 'eighties/basement',
  ],

  props: [
    'arcade_cabinet', 'neon_sign', 'boombox', 'poster', 'skateboard', 'cassette',
    'tv', 'table', 'chair', 'crate', 'lamp',
  ],

  characterTraits: {
    clothing: ['neon_jacket', 'leather_jacket', 'band_tee', 'tracksuit', 'tunic', 'vest', 'hoodie', 'tshirt'],
    accessory: ['sunglasses', 'headband', 'sweatband', 'walkman', 'none', 'cap', 'bandana', 'glasses'],
    footwear: ['high_tops', 'sneakers', 'boots', 'shoes', 'none'],
  },

  itemIcons: [
    'cassette_tape', 'walkman', 'coin', 'key', 'skateboard',
    'vhs_tape', 'food', 'drink', 'note', 'badge',
  ],
};
