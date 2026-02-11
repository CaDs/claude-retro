/**
 * Room: Village Square
 * A cobblestone square with a well, market stalls, and a notice board.
 */
export const villageSquare = {
  id: 'village_square',
  name: 'Village Square',
  bgColor: '#2a4a2a',
  description: 'The bustling village square. A stone well sits in the center, and colorful market stalls line the edges.',

  // Walkable area for player movement
  walkableArea: {
    rects: [
      { x: 20, y: 90, width: 280, height: 50 },
    ],
  },

  // Interactive hotspots
  hotspots: [
    {
      id: 'well',
      name: 'Stone Well',
      x: 135, y: 65, width: 50, height: 45,
      walkToX: 160, walkToY: 110,
      lookAt: 'An old stone well. It looks deep. There might be something down there.',
      use: null, // Set dynamically based on inventory
      pickUp: 'It\'s far too heavy to carry around.',
    },
    {
      id: 'notice_board',
      name: 'Notice Board',
      x: 245, y: 50, width: 35, height: 45,
      walkToX: 245, walkToY: 105,
      lookAt: 'A wooden notice board. One notice reads: "The Knight\'s Guild seeks brave souls! Present the Enchanted Tankard to prove your worth."',
      pickUp: 'I can\'t just take the whole board.',
    },
    {
      id: 'market_stall',
      name: 'Market Stall',
      x: 20, y: 55, width: 55, height: 45,
      walkToX: 55, walkToY: 105,
      lookAt: 'A market stall selling various trinkets and supplies. A coil of rope catches my eye.',
      pickUp: null, // Handled by puzzle system
    },
    {
      id: 'rope_on_stall',
      name: 'Rope',
      x: 35, y: 70, width: 20, height: 15,
      walkToX: 55, walkToY: 105,
      lookAt: 'A sturdy hempen rope. Looks useful.',
      pickUp: null, // Handled by puzzle system
      visible: true,
    },
  ],

  // Room exits
  exits: [
    {
      id: 'to_tavern',
      x: 290, y: 70, width: 30, height: 60,
      target: 'tavern',
      spawnX: 30, spawnY: 115,
      name: 'Tavern',
      lookAt: 'The Rusty Dragon Tavern. Sounds and warmth pour out through the door.',
    },
    {
      id: 'to_forest',
      x: 130, y: 45, width: 60, height: 20,
      target: 'forest_path',
      spawnX: 160, spawnY: 125,
      name: 'Forest Path',
      lookAt: 'A path leading into the dark forest to the north.',
    },
  ],

  // NPCs in this room
  npcs: [],
};
