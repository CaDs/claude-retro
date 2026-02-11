/**
 * Dialogue tree for Old Hermit Mirela.
 */
export const hermitDialogue = {
  startNode: 'start',
  nodes: {
    start: {
      text: 'Hmm? A visitor? How unusual... Come closer, child. What brings you to old Mirela\'s woods?',
      choices: [
        { text: 'I\'m looking for the Enchanted Tankard.', next: 'about_tankard' },
        { text: 'Who are you?', next: 'about_self' },
        { text: 'This is a beautiful forest.', next: 'about_forest' },
        { text: 'Sorry to bother you. Goodbye.', next: 'goodbye' },
      ],
    },

    about_tankard: {
      text: 'Ah, the Tankard of Ages! Many have sought it. Listen well: "What falls in the deep but rises with string, can buy what is locked where the dragons sing."',
      choices: [
        { text: 'A riddle! Let me think... something in the well?', next: 'riddle_answer' },
        { text: 'I don\'t understand. Can you be more direct?', next: 'direct_hint' },
        { text: 'Thanks, I\'ll figure it out.', next: 'goodbye' },
      ],
    },

    riddle_answer: {
      text: 'Clever child! Yes... use a rope at the well, and fortune shall rise. Then bring that fortune to where the dragon rests.',
      action: { type: 'set_flag', flag: 'hermit_hint_received' },
      choices: [
        { text: 'The Rusty Dragon tavern! I understand now!', next: 'understood' },
        { text: 'Tell me more about this place.', next: 'about_forest' },
      ],
    },

    direct_hint: {
      text: 'Very well. There is a gold coin at the bottom of the village well. Use a rope to fish it out. Take the coin to the tavern bartender — he\'ll give you the key to the tankard.',
      action: { type: 'set_flag', flag: 'hermit_hint_received' },
      choices: [
        { text: 'Now that\'s helpful! Thank you!', next: 'understood' },
      ],
    },

    understood: {
      text: 'Go now, young one. Your destiny awaits. And remember — not all treasures are made of gold.',
    },

    about_self: {
      text: 'I am Mirela, keeper of the old ways. I\'ve watched these woods for... oh, longer than you\'d believe. The trees whisper to me, and I whisper back.',
      choices: [
        { text: 'About the Enchanted Tankard...', next: 'about_tankard' },
        { text: 'Fascinating. I should go now.', next: 'goodbye' },
      ],
    },

    about_forest: {
      text: 'These woods are older than the kingdom itself. Fairy rings, ancient oaks, and secrets buried deep. Treat them with respect, and they\'ll treat you kindly.',
      choices: [
        { text: 'I will. About that tankard...', next: 'about_tankard' },
        { text: 'Beautiful. Goodbye, Mirela.', next: 'goodbye' },
      ],
    },

    goodbye: {
      text: 'May the old oaks guide your path, child.',
    },
  },
};
