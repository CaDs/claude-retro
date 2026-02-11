/**
 * Dialogue tree for Bartender Gruff.
 */
export const bartenderDialogue = {
  startNode: 'start',
  nodes: {
    start: {
      text: 'Welcome to the Rusty Dragon! What can I do for ye, young squire?',
      choices: [
        { text: 'I need the Enchanted Tankard up on that shelf.', next: 'ask_tankard' },
        { text: 'Tell me about this tavern.', next: 'about_tavern' },
        { text: 'Have you heard of a hermit in the forest?', next: 'about_hermit' },
        { text: 'Nothing, just passing through.', next: 'goodbye' },
      ],
    },

    ask_tankard: {
      text: 'Ha! That old thing? It\'s been sitting there for ages. But I can\'t just give it away — it\'s in the locked cabinet, and that cabinet is behind the bar. Tell ye what... bring me a gold coin and I\'ll give you the key.',
      choices: [
        { text: 'A gold coin? Where would I find one?', next: 'coin_hint' },
        { text: 'I already have a gold coin! Here you go.', next: 'give_coin',
          action: { type: 'check_item', item: 'gold_coin' }
        },
        { text: 'I\'ll be back.', next: 'goodbye' },
      ],
    },

    coin_hint: {
      text: 'Well, I heard the old well in the village square has swallowed many a coin over the years. If ye had a way to reach down there, you might fish one out.',
      choices: [
        { text: 'Thanks for the tip!', next: 'goodbye' },
        { text: 'Anything else I should know?', next: 'about_hermit' },
      ],
    },

    give_coin: {
      text: 'A deal\'s a deal! Here\'s the key to the cabinet. The tankard is all yours, squire. Good luck with the Knight\'s Guild!',
      action: { type: 'trade', give: 'gold_coin', receive: 'old_key' },
      next: 'goodbye_happy',
    },

    about_tavern: {
      text: 'The Rusty Dragon has stood here for over a hundred years. Best ale in the realm, if I do say so myself. And I do.',
      choices: [
        { text: 'Impressive! About that tankard though...', next: 'ask_tankard' },
        { text: 'I should get going.', next: 'goodbye' },
      ],
    },

    about_hermit: {
      text: 'Old Mirela? Aye, she lives out in the forest. Strange one, she is. Speaks mostly in riddles. But they say she knows things... ancient things.',
      choices: [
        { text: 'Sounds like someone I should visit.', next: 'goodbye' },
        { text: 'About that tankard...', next: 'ask_tankard' },
      ],
    },

    goodbye: {
      text: 'Come back anytime, squire!',
    },

    goodbye_happy: {
      text: 'Good doing business with ye! Now go show those knights what you\'re made of!',
    },
  },
};

/**
 * Dialogue after the player has already received the key.
 */
export const bartenderDialogueAfterKey = {
  startNode: 'start',
  nodes: {
    start: {
      text: 'You already have the key, squire! The cabinet\'s right there. Help yourself to the tankard.',
      choices: [
        { text: 'Right, thanks!', next: 'end' },
      ],
    },
    end: {
      text: 'Good luck out there!',
    },
  },
};
