import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 overflow-hidden rounded-lg shadow-md border border-green-500/20">
            <Image src="/logo.png" alt="Deck Assemble Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Deck Assemble <span className="text-xs font-semibold text-green-500">Marvel MTG</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex text-sm font-medium text-zinc-300">
          <Link href="/cards" className="hover:text-green-400 transition-colors">
            Browse Cards
          </Link>
          <Link href="/collection" className="hover:text-green-400 transition-colors">
            My Collection
          </Link>
          <Link href="/decks" className="hover:text-green-400 transition-colors">
            Decks
          </Link>
          <Link href="/recommendations" className="hover:text-green-400 transition-colors">
            Recommendations
          </Link>
          <Link href="/learn" className="hover:text-green-400 transition-colors">
            Learn MTG
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/deck-builder"
            className="rounded-lg bg-green-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-green-500 shadow-sm transition-all"
          >
            Build Deck
          </Link>
        </div>
      </div>
    </header>
  );
}
