import Link from 'next/link';
import { CardTile } from '@/components/cards/CardTile';
import { Card } from '@/types/card';

const sampleMarvelCards: Card[] = [
  {
    id: 'spidey-hero',
    oracleId: 'spidey-o-1',
    name: 'Spider-Man, Neighborhood Hero',
    manaCost: '{1}{U}{R}',
    manaValue: 3,
    colors: ['U', 'R'],
    colorIdentity: ['U', 'R'],
    typeLine: 'Legendary Creature — Hero Human',
    oracleText: 'Reach, Haste\nWhenever Spider-Man deals combat damage to a player, draw a card.',
    power: '3',
    toughness: '3',
    setCode: 'MARVEL',
    setName: 'Marvel Super Heroes MTG',
    rarity: 'mythic',
    legalities: { commander: 'legal' },
  },
  {
    id: 'ironman-hero',
    oracleId: 'ironman-o-1',
    name: 'Iron Man, Tech Innovator',
    manaCost: '{2}{U}{R}{W}',
    manaValue: 5,
    colors: ['U', 'R', 'W'],
    colorIdentity: ['U', 'R', 'W'],
    typeLine: 'Legendary Artifact Creature — Hero Engineer',
    oracleText: 'Flying, Ward {2}\nArtifact spells you cast cost {1} less to cast.',
    power: '4',
    toughness: '5',
    setCode: 'MARVEL',
    setName: 'Marvel Super Heroes MTG',
    rarity: 'mythic',
    legalities: { commander: 'legal' },
  },
  {
    id: 'wolverine-hero',
    oracleId: 'wolverine-o-1',
    name: 'Wolverine, Mutant Berserker',
    manaCost: '{1}{R}{G}',
    manaValue: 3,
    colors: ['R', 'G'],
    colorIdentity: ['R', 'G'],
    typeLine: 'Legendary Creature — Hero Mutant',
    oracleText: 'Trample, Indestructible\nWhenever Wolverine is dealt damage, put two +1/+1 counters on it.',
    power: '3',
    toughness: '2',
    setCode: 'MARVEL',
    setName: 'Marvel Super Heroes MTG',
    rarity: 'rare',
    legalities: { commander: 'legal' },
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 bg-radial from-green-950/40 via-zinc-950 to-zinc-950 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-950/40 px-3.5 py-1 text-xs font-semibold text-green-400 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Marvel Magic: The Gathering Deck Intelligence
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
              Master Magic. Build Legal Decks. <br />
              <span className="bg-gradient-to-r from-green-500 via-purple-500 to-green-400 bg-clip-text text-transparent">
                Assemble Your Heroes.
              </span>
            </h1>

            <p className="text-lg text-zinc-400 leading-relaxed">
              Deck Assemble helps beginners understand card synergy, mana curves, and format rules, while empowering experienced players to build optimized Commander decks using their physical card collection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 justify-center sm:justify-start">
              <Link
                href="/decks/create"
                className="rounded-xl bg-gradient-to-r from-green-600 to-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-green-950/50 hover:brightness-110 transition-all"
              >
                Build Commander Deck
              </Link>
              <Link
                href="/cards"
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-6 py-3 text-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700 transition-all"
              >
                Browse Marvel Cards
              </Link>
              <Link
                href="/learn"
                className="rounded-xl border border-zinc-800/80 px-6 py-3 text-sm font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                How Magic Works →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cards Section */}
      <section className="py-16 bg-zinc-950/50 border-b border-zinc-800/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Marvel Hero Commander Showcase</h2>
              <p className="text-sm text-zinc-400">Discover hero cards and build around legendary leaders.</p>
            </div>
            <Link href="/cards" className="text-xs font-bold text-green-400 hover:text-green-300">
              View All Supported Cards →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleMarvelCards.map((card) => (
              <CardTile key={card.id} card={card} ownedQuantity={1} />
            ))}
          </div>
        </div>
      </section>

      {/* Primary User Workflow Section */}
      <section className="py-20 bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">How Deck Assemble Works</h2>
            <p className="text-zinc-400 text-sm">
              From card collection to commander deck recommendations and strategy guides in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-green-950/80 text-green-400 font-bold border border-green-800/50">
                1
              </div>
              <h3 className="font-bold text-zinc-100">Search Cards</h3>
              <p className="text-xs text-zinc-400">
                Browse Marvel-themed cards with rich filtering by mana cost, color identity, and character abilities.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-amber-950/80 text-amber-400 font-bold border border-amber-800/50">
                2
              </div>
              <h3 className="font-bold text-zinc-100">Manage Collection</h3>
              <p className="text-xs text-zinc-400">
                Record cards you physically own so you can generate legal decks strictly using your existing binder.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-blue-950/80 text-blue-400 font-bold border border-blue-800/50">
                3
              </div>
              <h3 className="font-bold text-zinc-100">Validate Legality</h3>
              <p className="text-xs text-zinc-400">
                Automatic Commander format validation checking color identity, card counts, and banned lists.
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-6 space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-emerald-950/80 text-emerald-400 font-bold border border-emerald-800/50">
                4
              </div>
              <h3 className="font-bold text-zinc-100">Intelligent Guidance</h3>
              <p className="text-xs text-zinc-400">
                Receive recommended additions and replacements with plain-language explanations of basic deck strategy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
