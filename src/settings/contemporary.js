export const contemporary = {
  id: 'contemporary',
  name: 'Contemporary',
  description: 'Modern-day cities, offices, apartments and streets',

  palettes: {
    apartment_neutral: {
      black: '#000000', dark_brown: '#3a2a1a', brown: '#6a4a2a', tan: '#9a7a5a',
      beige: '#ccaa88', off_white: '#ddd8cc', white: '#eeeee8', dark_gray: '#3a3a3a',
      gray: '#6a6a6a', light_gray: '#9a9a9a', dark_blue: '#2a3a5a', blue: '#4a6a9a',
      dark_red: '#6a2a2a', red: '#aa4444', green: '#4a7a4a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    city_day: {
      black: '#000000', dark_gray: '#2a2a2a', gray: '#5a5a5a', light_gray: '#8a8a8a',
      concrete: '#aaaaaa', white: '#dddddd', dark_blue: '#1a2a5a', blue: '#3a5a9a',
      light_blue: '#7aaadd', dark_brown: '#3a2a15', brown: '#6a4a2a', tan: '#9a7a5a',
      red: '#aa3333', yellow: '#ccaa33', green: '#3a7a3a', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    office_bright: {
      black: '#000000', white: '#eeeef0', off_white: '#ccccdd', pale_blue: '#aabbcc',
      light_gray: '#aaaaaa', gray: '#777777', dark_gray: '#444444', dark_blue: '#2a3a6a',
      blue: '#4a6aaa', light_blue: '#7a9acc', brown: '#6a4a2a', tan: '#9a7a5a',
      green: '#4a8a4a', red: '#aa3a3a', yellow: '#ccaa44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    park_green: {
      black: '#000000', dark_green: '#0f3a0f', green: '#2a6a2a', light_green: '#4a9a4a',
      bright_green: '#6acc6a', dark_brown: '#2a1a0a', brown: '#5a3a15', tan: '#8a6a3a',
      dark_blue: '#1a2a5a', blue: '#4a7aaa', light_blue: '#88bbdd', gray: '#6a6a6a',
      light_gray: '#9a9a9a', white: '#dddddd', yellow: '#cccc44', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
    subway_dark: {
      black: '#000000', dark_gray: '#1a1a1a', gray: '#3a3a3a', mid_gray: '#5a5a5a',
      light_gray: '#7a7a7a', pale_gray: '#9a9a9a', white: '#bbbbbb', dark_brown: '#2a1a0a',
      brown: '#4a3a2a', dark_yellow: '#8a7a22', yellow: '#ccaa33', dark_blue: '#0a1a3a',
      blue: '#2a3a6a', red: '#8a2a2a', orange: '#aa5533', skin_base: '#d4a574', skin_shadow: '#a0724a',
    },
  },

  templates: [
    'contemporary/apartment', 'contemporary/city_street', 'contemporary/office', 'contemporary/park',
    'contemporary/cafe', 'contemporary/subway_station', 'contemporary/warehouse', 'contemporary/parking_lot',
  ],

  props: [
    'bench', 'trash_can', 'lamppost', 'mailbox', 'dumpster', 'planter', 'atm',
    'table', 'chair', 'crate', 'lamp',
  ],

  characterTraits: {
    clothing: ['jacket', 'suit', 'hoodie', 'tshirt', 'tunic', 'vest', 'robe', 'apron'],
    accessory: ['sunglasses', 'hat', 'headphones', 'glasses', 'none', 'cap', 'scarf', 'badge'],
    footwear: ['sneakers', 'shoes', 'boots', 'sandals', 'none'],
  },

  itemIcons: [
    'key', 'phone', 'wallet', 'flashlight', 'toolbox',
    'note', 'food', 'drink', 'usb_drive', 'badge',
  ],
};
