/**
 * Puzzle definitions and interaction responses.
 * Maps verb + object (+ optional item) to game actions.
 */
export const PUZZLES = {
  /**
   * PUZZLE 1: Pick up rope from market stall
   */
  'pick up:rope_on_stall': {
    conditions: [],
    actions: [
      { type: 'say', text: 'I\'ll take this rope. Might come in handy.' },
      { type: 'add_item', item: 'rope' },
      { type: 'hide_hotspot', room: 'village_square', hotspot: 'rope_on_stall' },
    ],
    failText: null,
  },

  /**
   * PUZZLE 2: Pick up bucket from forest
   */
  'pick up:bucket_stump': {
    conditions: [],
    actions: [
      { type: 'say', text: 'This bucket could be useful.' },
      { type: 'add_item', item: 'bucket' },
      { type: 'hide_hotspot', room: 'forest_path', hotspot: 'bucket_stump' },
    ],
  },

  /**
   * PUZZLE 3: Use rope with well → get gold coin
   */
  'use:rope:well': {
    conditions: [{ type: 'has_item', item: 'rope' }],
    actions: [
      { type: 'say', text: 'I\'ll lower the rope into the well...' },
      { type: 'wait', frames: 40 },
      { type: 'say', text: 'I can feel something! Let me pull it up...' },
      { type: 'wait', frames: 30 },
      { type: 'say', text: 'A gold coin! It was stuck in a crack between the stones.' },
      { type: 'add_item', item: 'gold_coin' },
      { type: 'remove_item', item: 'rope' },
      { type: 'set_flag', flag: 'got_coin_from_well' },
    ],
    failText: 'I need something to lower into the well first.',
  },

  /**
   * PUZZLE 3b: Use bucket with well (alternative)
   */
  'use:bucket:well': {
    conditions: [{ type: 'has_item', item: 'bucket' }],
    actions: [
      { type: 'say', text: 'I lower the bucket into the well...' },
      { type: 'wait', frames: 40 },
      { type: 'say', text: 'Just water. I need something thinner to reach into the cracks.' },
    ],
    failText: null,
  },

  /**
   * PUZZLE 4: Give coin to bartender → get key (handled in dialogue)
   * This is triggered via the dialogue action system.
   */

  /**
   * PUZZLE 5: Use key with cabinet → get enchanted tankard
   */
  'use:old_key:cabinet': {
    conditions: [{ type: 'has_item', item: 'old_key' }],
    actions: [
      { type: 'say', text: 'The key fits! Let me open the cabinet...' },
      { type: 'wait', frames: 30 },
      { type: 'say', text: 'The Enchanted Tankard! It glows with a warm, golden light.' },
      { type: 'add_item', item: 'enchanted_tankard' },
      { type: 'remove_item', item: 'old_key' },
      { type: 'set_flag', flag: 'got_tankard' },
      { type: 'wait', frames: 20 },
      { type: 'say', text: 'Now I can present this to the Knight\'s Guild!' },
    ],
    failText: 'The cabinet is locked. I need a key.',
  },

  /**
   * Look at the notice board after getting the tankard
   */
  'look at:notice_board:flag:got_tankard': {
    conditions: [{ type: 'has_flag', flag: 'got_tankard' }],
    actions: [
      { type: 'say', text: 'The notice says to present the Enchanted Tankard to the Knight\'s Guild. I have it! My quest is complete!' },
      { type: 'set_flag', flag: 'game_complete' },
      { type: 'wait', frames: 30 },
      { type: 'show_ending' },
    ],
  },
};

/**
 * Default responses when no puzzle matches.
 */
export const DEFAULT_RESPONSES = {
  'look at': 'Nothing special about it.',
  'pick up': 'I can\'t pick that up.',
  'use': 'I can\'t use that.',
  'open': 'It doesn\'t open.',
  'close': 'It\'s not open.',
  'push': 'It won\'t budge.',
  'pull': 'Nothing happens.',
  'give': 'I don\'t think they want that.',
  'talk to': 'I don\'t think talking to that will help.',
};
