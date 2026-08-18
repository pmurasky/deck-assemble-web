export interface TourStep {
  title: string;
  tag: string;
  description: string;
  route: string;
  highlightText: string;
  actionLabel?: string;
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Your MTG Decks Hub',
    tag: 'Step 1 of 4 • Decks',
    description: 'Manage, brew, import, and duplicate your Commander and MTG decks in one central hub. Filter by format, track card counts, and organize your brews effortlessly.',
    route: '/decks',
    highlightText: 'Deck Library & Management',
  },
  {
    title: 'Intelligent Deck Builder',
    tag: 'Step 2 of 4 • Studio',
    description: 'Construct synergistic decks with real-time legality validation, ownership filters, mana curve analytics, and AI-powered recommendations.',
    route: '/deck-builder',
    highlightText: 'Live Search & Mana Analysis',
  },
  {
    title: 'Learn MTG & Commander',
    tag: 'Step 3 of 4 • Learn',
    description: 'Master turn structures, card types, combat phases, and format-specific rules with beginner guides and a searchable keyword glossary.',
    route: '/learn',
    highlightText: 'Rules & Keyword Glossary',
  },
  {
    title: "You're Ready to Build!",
    tag: 'Step 4 of 4 • Finish',
    description: "You're all set to start crafting your custom decks. You can replay this tour anytime from your Settings whenever you need a quick refresher.",
    route: '/deck-builder',
    highlightText: 'Start Your Journey',
    actionLabel: 'Get Started',
  },
];
