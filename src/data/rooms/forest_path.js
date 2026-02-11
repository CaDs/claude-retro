/**
 * Room: Forest Path
 * A winding path through ancient trees. A hermit dwells here.
 */
export const forestPath = {
  id: 'forest_path',
  name: 'Forest Path',
  bgColor: '#1a3a1a',
  description: 'A mossy path winds between towering ancient oaks. Shafts of light pierce the canopy.',

  walkableArea: {
    rects: [
      { x: 30, y: 95, width: 260, height: 45 },
    ],
  },

  hotspots: [
    {
      id: 'ancient_tree',
      name: 'Ancient Oak',
      x: 40, y: 20, width: 60, height: 75,
      walkToX: 70, walkToY: 105,
      lookAt: 'An immense oak tree, hundreds of years old. Moss covers its gnarled trunk.',
      use: 'I\'m not sure what I\'d do with a tree.',
      push: 'I push on it. Nothing happens. Obviously.',
    },
    {
      id: 'mushroom_ring',
      name: 'Mushroom Ring',
      x: 200, y: 100, width: 35, height: 20,
      walkToX: 215, walkToY: 115,
      lookAt: 'A fairy ring of glowing mushrooms. Local legend says they mark a place of old magic.',
      pickUp: 'Better not. Disturbing a fairy ring is terrible luck.',
      use: 'I don\'t think I should meddle with fairy magic.',
    },
    {
      id: 'old_stump',
      name: 'Old Stump',
      x: 250, y: 70, width: 30, height: 25,
      walkToX: 250, walkToY: 105,
      lookAt: 'A carved stump that serves as a makeshift table. There\'s a bucket beside it.',
    },
    {
      id: 'bucket_stump',
      name: 'Bucket',
      x: 260, y: 85, width: 15, height: 15,
      walkToX: 250, walkToY: 105,
      lookAt: 'An empty wooden bucket. Might come in handy.',
      visible: true,
    },
  ],

  exits: [
    {
      id: 'to_village',
      x: 130, y: 130, width: 60, height: 15,
      target: 'village_square',
      spawnX: 160, spawnY: 95,
      name: 'Village Square',
      lookAt: 'The path back to the village.',
    },
  ],

  npcs: [
    {
      id: 'hermit',
      name: 'Old Hermit',
      x: 120, y: 60, width: 20, height: 30,
      walkToX: 130, walkToY: 105,
      dialogueKey: 'hermit',
      lookAt: 'An old woman wrapped in a green shawl. Her eyes seem to know things.',
    },
  ],
};
