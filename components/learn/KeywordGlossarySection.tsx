import { KEYWORDS, type KeywordItem } from '@/lib/keywords';

export type { KeywordItem };
export { KEYWORDS };

function KeywordCard({ item }: { item: KeywordItem }) {
  return (
    <div
      data-testid="keyword-card"
      className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 transition-colors flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <h3 className="font-bold text-lg text-zinc-100">{item.name}</h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/60">
            {item.category}
          </span>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

export function KeywordGlossarySection() {
  return (
    <section id="keywords" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Keyword Glossary</h2>
        <p className="text-zinc-400 mt-2 text-lg">
          Official reminder text and plain-English definitions for common Magic keyword abilities and mechanics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {KEYWORDS.map((item) => (
          <KeywordCard key={item.name} item={item} />
        ))}
      </div>
    </section>
  );
}
