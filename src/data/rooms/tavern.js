/**
 * Room: The Rusty Dragon Tavern
 * Dimly lit tavern interior with a bartender NPC.
 */
export const tavern = {
  id: 'tavern',
  name: 'The Rusty Dragon Tavern',
  bgColor: '#3a2a1a',
  description: 'A warm, dimly lit tavern. The smell of ale and woodsmoke fills the air.',

  walkableArea: {
    rects: [
      { x: 20, y: 95, width: 280, height: 45 },
    ],
  },

  hotspots: [
    {
      id: 'bar_counter',
      name: 'Bar Counter',
      x: 100, y: 60, width: 120, height: 30,
      walkToX: 160, walkToY: 100,
      lookAt: 'A well-worn oaken bar counter. Many a tale has been told here.',
      use: 'I should talk to the bartender instead.',
    },
    {
      id: 'tankard_shelf',
      name: 'High Shelf',
      x: 140, y: 20, width: 40, height: 25,
      walkToX: 160, walkToY: 100,
      lookAt: 'A high shelf behind the bar. I can see a glowing tankard up there!  That must be the Enchanted Tankard!',
      pickUp: 'The shelf is too high, and the bartender is watching. I need a key to the cabinet.',
      use: 'I can\'t reach it directly.',
    },
    {
      id: 'cabinet',
      name: 'Cabinet',
      x: 230, y: 30, width: 30, height: 55,
      walkToX: 230, walkToY: 100,
      lookAt: 'A locked wooden cabinet behind the bar. Something valuable must be inside.',
      use: null, // Key interaction handled by puzzle system
      open: 'It\'s locked tight.',
    },
    {
      id: 'fireplace',
      name: 'Fireplace',
      x: 10, y: 40, width: 45, height: 50,
      walkToX: 40, walkToY: 100,
      lookAt: 'A crackling fireplace. The warmth is very welcome.',
      use: 'I\'d rather not stick my hand in there.',
    },
    {
      id: 'barrel',
      name: 'Ale Barrel',
      x: 270, y: 75, width: 30, height: 35,
      walkToX: 260, walkToY: 110,
      lookAt: 'A large barrel of ale. It smells strong.',
      open: 'Better not. The bartender would not be happy.',
    },
  ],

  exits: [
    {
      id: 'to_village',
      x: 0, y: 70, width: 20, height: 60,
      target: 'village_square',
      spawnX: 270, spawnY: 115,
      name: 'Village Square',
      lookAt: 'The door back to the village square.',
    },
  ],

  npcs: [
    {
      id: 'bartender',
      name: 'Bartender Gruff',
      x: 165, y: 52, width: 20, height: 30,
      walkToX: 160, walkToY: 100,
      dialogueKey: 'bartender',
      lookAt: 'A burly man with a magnificent beard. He polishes a glass with practiced ease.',
    },
  ],
};
