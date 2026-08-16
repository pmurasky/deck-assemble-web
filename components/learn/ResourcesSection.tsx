import React from 'react';
import { ExternalLink, BookOpen, Crown, TrendingUp, Gamepad2, type LucideIcon } from 'lucide-react';

export interface ResourceLink {
  name: string;
  url: string;
  description: string;
  badge?: string;
}

export interface ResourceCategory {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  links: ResourceLink[];
}

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    title: 'Rules & Beginner Explainers',
    description: 'Fundamental guides and video tutorials for mastering core Magic mechanics.',
    icon: BookOpen,
    color: 'text-green-400 bg-green-950/50 border-green-800/50',
    links: [
      {
        name: 'Tolarian Community College',
        url: 'https://www.youtube.com/@TolarianCommunityCollege',
        description: 'Comprehensive tutorials, product reviews, and beginner deckbuilding guides.',
        badge: 'YouTube',
      },
      {
        name: "Wizards' Official New-Player Guide",
        url: 'https://magic.wizards.com/en/how-to-play',
        description: 'Official how-to-play walkthroughs, basic rules, and format overviews.',
        badge: 'Official',
      },
      {
        name: 'Judge Academy & Rules',
        url: 'https://magic.wizards.com/en/rules',
        description: 'Comprehensive Magic rules database and official policy documents.',
        badge: 'Rules',
      },
    ],
  },
  {
    title: 'Commander Strategy',
    description: 'Specialized singleton strategy, commander synergy analysis, and podcast breakdowns.',
    icon: Crown,
    color: 'text-purple-400 bg-purple-950/50 border-purple-800/50',
    links: [
      {
        name: 'EDHREC',
        url: 'https://edhrec.com',
        description: 'Commander recommendations, synergy percentages, and deck stats.',
        badge: 'Analytics',
      },
      {
        name: 'The Command Zone',
        url: 'https://www.youtube.com/@CommandCast',
        description: 'Premier Commander gameplay discussions, deck techs, and strategic theory.',
        badge: 'Podcast',
      },
      {
        name: "Commander's Herald",
        url: 'https://commandersherald.com',
        description: 'Thoughtful articles, format philosophy, and deck brewing guides.',
        badge: 'Articles',
      },
    ],
  },
  {
    title: 'Meta & Deck Context',
    description: 'Tournament statistics, metagame trends, pricing, and community deckbases.',
    icon: TrendingUp,
    color: 'text-blue-400 bg-blue-950/50 border-blue-800/50',
    links: [
      {
        name: 'MTGGoldfish',
        url: 'https://www.mtggoldfish.com',
        description: 'Metagame breakdowns, format price indexes, and tournament results.',
        badge: 'Metagame',
      },
      {
        name: 'MTGTop8',
        url: 'https://mtgtop8.com',
        description: 'Competitive tournament decklists, top8 rankings, and archetype breakdowns.',
        badge: 'Tournaments',
      },
      {
        name: 'Moxfield',
        url: 'https://www.moxfield.com',
        description: 'Popular deck builder platform, testing sandbox, and community lists.',
        badge: 'Community',
      },
    ],
  },
  {
    title: 'Format-Specific Practice',
    description: 'Interactive draft practice, digital client resources, and simulator play.',
    icon: Gamepad2,
    color: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
    links: [
      {
        name: 'Draftsim',
        url: 'https://draftsim.com',
        description: 'Draft simulator and card evaluation tools for all recent MTG sets.',
        badge: 'Limited',
      },
      {
        name: 'MTG Arena Zone',
        url: 'https://mtgazone.com',
        description: 'MTG Arena decklists, tier lists, event schedules, and booster codes.',
        badge: 'Digital',
      },
      {
        name: 'Untap.in',
        url: 'https://untap.in',
        description: 'Browser-based virtual tabletop for deck testing with players worldwide.',
        badge: 'Playtest',
      },
    ],
  },
];

function ResourceLinkItem({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block p-4 bg-zinc-900/40 hover:bg-zinc-800/60 border border-zinc-800/80 hover:border-zinc-700 rounded-lg transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-semibold text-zinc-100 group-hover:text-green-400 flex items-center gap-1.5 transition-colors">
          {link.name}
          <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
        </span>
        {link.badge && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
            {link.badge}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">{link.description}</p>
    </a>
  );
}

function ResourceCategoryCard({ category }: { category: ResourceCategory }) {
  const Icon = category.icon;
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${category.color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{category.title}</h3>
        </div>
        <p className="text-sm text-zinc-400">{category.description}</p>
      </div>

      <div className="space-y-3 pt-2">
        {category.links.map((link) => (
          <ResourceLinkItem key={link.name} link={link} />
        ))}
      </div>
    </div>
  );
}

export function ResourcesSection() {
  return (
    <section id="resources" className="scroll-mt-32 space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h2 className="text-3xl font-extrabold text-white">Learn More Resources</h2>
        <p className="text-zinc-400 mt-2 text-lg">
          Curated external community tools, rules guides, and strategy channels across the Magic multiverse.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {RESOURCE_CATEGORIES.map((category) => (
          <ResourceCategoryCard key={category.title} category={category} />
        ))}
      </div>
    </section>
  );
}
