export type RulesCategory = 'Rules & Timing' | 'Combat Steps' | 'Combat' | 'Casting & Costs';

export interface RulesItem {
  name: string;
  category: RulesCategory;
  description: string;
}

export const RULES_ENTRIES: RulesItem[] = [
  {
    name: 'The Stack',
    category: 'Rules & Timing',
    description:
      'A game zone where spells and activated or triggered abilities wait to resolve. Spells and abilities resolve in Last-In, First-Out (LIFO) order as each player passes priority in succession without taking further actions.',
  },
  {
    name: 'Priority',
    category: 'Rules & Timing',
    description:
      'The system that determines which player can take an action, cast an instant, or activate an ability. The active player receives priority first during each phase and step. All players must pass priority on an empty stack before the game advances to the next step.',
  },
  {
    name: 'State-Based Actions',
    category: 'Rules & Timing',
    description:
      'Automatic game-state checks performed continuously whenever a player would receive priority. Examples include creatures with lethal damage being destroyed, planeswalkers with 0 loyalty being put into the graveyard, or a player at 0 life losing the game.',
  },
  {
    name: 'Beginning of Combat Step',
    category: 'Combat Steps',
    description:
      'The opening step of the Combat Phase. "At the beginning of combat" triggers go on the stack, and players receive priority to cast instants or activate abilities before attackers are declared.',
  },
  {
    name: 'Declare Attackers Step',
    category: 'Combat Steps',
    description:
      'The active player declares which untapped creatures will attack and which opponent or planeswalker each is attacking. Attackers tap unless they have vigilance. Players receive priority after attackers are declared.',
  },
  {
    name: 'Declare Blockers Step',
    category: 'Combat Steps',
    description:
      'The defending player declares which untapped creatures will block attacking creatures. Blockers are assigned to attackers. Players receive priority after all blockers have been declared.',
  },
  {
    name: 'Combat Damage Step',
    category: 'Combat Steps',
    description:
      'Attacking and blocking creatures assign and deal combat damage simultaneously. If any creatures have first strike or double strike, an additional combat damage step is created beforehand. Players receive priority after damage resolves.',
  },
  {
    name: 'End of Combat Step',
    category: 'Combat Steps',
    description:
      'The final step of the combat phase where "until end of combat" effects trigger and wear off. Players receive priority once more before moving to Main Phase 2.',
  },
  {
    name: 'Untap Step',
    category: 'Rules & Timing',
    description:
      'The active player phases in permanents and untaps all tapped permanents they control. No player receives priority and no spells or abilities can be cast during this step.',
  },
  {
    name: 'Upkeep Step',
    category: 'Rules & Timing',
    description:
      'The step following untap where "at the beginning of your upkeep" abilities trigger. The active player receives priority first to cast instants and activate abilities.',
  },
  {
    name: 'Draw Step',
    category: 'Rules & Timing',
    description:
      'The active player draws the top card of their library (except the starting player on turn 1 in a two-player match). After drawing, players receive priority.',
  },
  {
    name: 'End Step',
    category: 'Rules & Timing',
    description:
      'The first step of the Ending Phase where "at the beginning of the end step" abilities trigger. Players receive priority in turn order to take actions.',
  },
  {
    name: 'Cleanup Step',
    category: 'Rules & Timing',
    description:
      'The active player discards down to maximum hand size (usually 7 cards), marked damage is removed from creatures, and "until end of turn" effects expire. No player receives priority unless an ability triggers.',
  },
  {
    name: 'Commander Tax',
    category: 'Rules & Timing',
    description:
      'An additional cost of {2} mana for each time you have previously cast your commander from the command zone during the game.',
  },
  {
    name: 'Commander Damage',
    category: 'Combat',
    description:
      'If a player is dealt 21 or more combat damage by a single commander over the course of the game, that player loses the game as a state-based action.',
  },
  {
    name: 'Color Identity',
    category: 'Rules & Timing',
    description:
      'The combination of all mana symbols in a card\'s mana cost, rules text, and any color indicator. In Commander, every card in the deck must match the commander\'s color identity.',
  },
];
