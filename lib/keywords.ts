import { RULES_ENTRIES, type RulesCategory, type RulesItem } from './rules-entries';

export type KeywordCategory =
  | 'Combat'
  | 'Evergreen'
  | 'Casting & Costs'
  | 'Graveyard & Zones'
  | 'Triggers & Utility';

export type GlossaryCategory = KeywordCategory | RulesCategory;

export interface KeywordItem {
  name: string;
  category: KeywordCategory;
  description: string;
}

export type GlossaryItem = KeywordItem | RulesItem;
export { RULES_ENTRIES, type RulesCategory, type RulesItem };

export const KEYWORDS: KeywordItem[] = [
  {
    name: 'Flying',
    category: 'Combat',
    description: "This creature can't be blocked except by creatures with flying and/or reach.",
  },
  {
    name: 'First Strike',
    category: 'Combat',
    description: 'This creature deals combat damage before creatures without first strike.',
  },
  {
    name: 'Double Strike',
    category: 'Combat',
    description: 'This creature deals both first-strike and regular combat damage.',
  },
  {
    name: 'Deathtouch',
    category: 'Combat',
    description: 'Any amount of damage this deals to a creature is enough to destroy it.',
  },
  {
    name: 'Trample',
    category: 'Combat',
    description: "This creature can deal excess combat damage to the player or planeswalker it's attacking.",
  },
  {
    name: 'Vigilance',
    category: 'Combat',
    description: "Attacking doesn't cause this creature to tap.",
  },
  {
    name: 'Haste',
    category: 'Evergreen',
    description: 'This creature can attack and {T} as soon as it comes under your control.',
  },
  {
    name: 'Hexproof',
    category: 'Evergreen',
    description: "This permanent can't be the target of spells or abilities your opponents control.",
  },
  {
    name: 'Indestructible',
    category: 'Evergreen',
    description: "Effects that say 'destroy' don't destroy this permanent, and damage dealt to it isn't lethal.",
  },
  {
    name: 'Lifelink',
    category: 'Combat',
    description: 'Damage dealt by this creature also causes you to gain that much life.',
  },
  {
    name: 'Reach',
    category: 'Combat',
    description: 'This creature can block creatures with flying.',
  },
  {
    name: 'Flash',
    category: 'Casting & Costs',
    description: 'You may cast this spell any time you could cast an instant.',
  },
  {
    name: 'Menace',
    category: 'Combat',
    description: "This creature can't be blocked except by two or more creatures.",
  },
  {
    name: 'Defender',
    category: 'Evergreen',
    description: "This creature can't attack.",
  },
  {
    name: 'Ward',
    category: 'Evergreen',
    description: 'Whenever this permanent becomes the target of a spell or ability an opponent controls, counter it unless that player pays the ward cost.',
  },
  {
    name: 'Flashback',
    category: 'Graveyard & Zones',
    description: 'You may cast this card from your graveyard for its flashback cost. Then exile it.',
  },
  {
    name: 'Scry',
    category: 'Triggers & Utility',
    description: 'Look at the top N cards of your library, then put any number of them on the bottom of your library and the rest on top in any order.',
  },
  {
    name: 'Surveil',
    category: 'Triggers & Utility',
    description: 'Look at the top N cards of your library, then put any number of them into your graveyard and the rest on top of your library in any order.',
  },
  {
    name: 'Prowess',
    category: 'Triggers & Utility',
    description: 'Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.',
  },
  {
    name: 'Fight',
    category: 'Combat',
    description: 'Each deals damage equal to its power to the other.',
  },
  {
    name: 'Exile',
    category: 'Graveyard & Zones',
    description: 'Remove a card or permanent completely from the game into the exile zone.',
  },
  {
    name: 'Mill',
    category: 'Graveyard & Zones',
    description: 'Put the top N cards of your library into your graveyard.',
  },
  {
    name: 'Counter',
    category: 'Triggers & Utility',
    description: "Cancel a spell before it resolves, sending it to its owner's graveyard.",
  },
  {
    name: 'Equip',
    category: 'Casting & Costs',
    description: 'Attach this Equipment to target creature you control. Equip only as a sorcery.',
  },
  {
    name: 'Crew',
    category: 'Casting & Costs',
    description: 'Tap any number of creatures you control with total power N or more: This Vehicle becomes an artifact creature until end of turn.',
  },
  {
    name: 'Cascade',
    category: 'Casting & Costs',
    description: 'When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the rest on the bottom in a random order.',
  },
  {
    name: 'Cycling',
    category: 'Triggers & Utility',
    description: 'Pay the cycling cost, Discard this card: Draw a card.',
  },
  {
    name: 'Kicker',
    category: 'Casting & Costs',
    description: 'You may pay an additional cost as you cast this spell for extra effects.',
  },
  {
    name: 'Buyback',
    category: 'Casting & Costs',
    description: 'You may pay an additional cost as you cast this spell. If you do, put this card into your hand as it resolves.',
  },
  {
    name: 'Rebound',
    category: 'Casting & Costs',
    description: 'If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.',
  },
  {
    name: 'Morph',
    category: 'Casting & Costs',
    description: 'You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.',
  },
  {
    name: 'Protection',
    category: 'Evergreen',
    description: "This permanent can't be targeted, enchanted, equipped, fortified, damaged, or blocked by anything of the specified quality.",
  },
  {
    name: 'Convoke',
    category: 'Casting & Costs',
    description: 'Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature’s color.',
  },
  {
    name: 'Delve',
    category: 'Casting & Costs',
    description: 'Each card you exile from your graveyard while casting this spell pays for {1}.',
  },
  {
    name: 'Affinity',
    category: 'Casting & Costs',
    description: 'This spell costs {1} less to cast for each permanent you control of the specified type.',
  },
  {
    name: 'Proliferate',
    category: 'Triggers & Utility',
    description: 'Choose any number of permanents and/or players with counters on them, then give each another counter of each kind already there.',
  },
  {
    name: 'Undying',
    category: 'Graveyard & Zones',
    description: 'When this creature dies, if it had no +1/+1 counters on it, return it to the battlefield under its owner’s control with a +1/+1 counter on it.',
  },
  {
    name: 'Persist',
    category: 'Graveyard & Zones',
    description: 'When this creature dies, if it had no -1/-1 counters on it, return it to the battlefield under its owner’s control with a -1/-1 counter on it.',
  },
  {
    name: 'Unearth',
    category: 'Graveyard & Zones',
    description: 'Return this card from your graveyard to the battlefield. It gains haste. Exile it at the beginning of the next end step or if it leaves the battlefield.',
  },
  {
    name: 'Enchant',
    category: 'Evergreen',
    description: 'Attach to the specified target permanent or player when cast as an Aura spell.',
  },
];

export const KEYWORDS_BY_NAME: Record<string, KeywordItem> = KEYWORDS.reduce(
  (acc, keyword) => {
    acc[keyword.name.toLowerCase()] = keyword;
    return acc;
  },
  {} as Record<string, KeywordItem>
);

export function getKeyword(name: string): KeywordItem | undefined {
  if (!name) return undefined;
  return KEYWORDS_BY_NAME[name.trim().toLowerCase()];
}

export function getKeywordNames(): string[] {
  return KEYWORDS.map((k) => k.name);
}

export const GLOSSARY_ITEMS: GlossaryItem[] = [...KEYWORDS, ...RULES_ENTRIES];

export const GLOSSARY_CATEGORIES: string[] = [
  'Combat',
  'Evergreen',
  'Casting & Costs',
  'Graveyard & Zones',
  'Triggers & Utility',
  'Rules & Timing',
  'Combat Steps',
];

export const GLOSSARY_BY_NAME: Record<string, GlossaryItem> = GLOSSARY_ITEMS.reduce(
  (acc, item) => {
    acc[item.name.toLowerCase()] = item;
    const lower = item.name.toLowerCase();
    if (lower.startsWith('the ')) {
      acc[lower.slice(4)] = item;
    }
    return acc;
  },
  {} as Record<string, GlossaryItem>
);

export function getGlossaryItem(name: string): GlossaryItem | undefined {
  if (!name) return undefined;
  return GLOSSARY_BY_NAME[name.trim().toLowerCase()];
}

export function getGlossaryNames(): string[] {
  return GLOSSARY_ITEMS.map((item) => item.name);
}
