'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const sections = [
  { id: 'objective', label: 'The Goal of the Game' },
  { id: 'colors', label: 'The 5 Colors of Mana' },
  { id: 'types', label: 'Card Types' },
  { id: 'turns', label: 'Turn Structure' },
  { id: 'commander', label: 'Commander Basics' },
];

export function LearnSidebar() {
  const [activeId, setActiveId] = useState<string>('objective');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <nav className="sticky top-24 w-full md:w-64 space-y-2 p-4 bg-zinc-900/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm self-start hidden md:block">
      <h3 className="text-lg font-bold text-zinc-100 mb-4 px-2">How to Play</h3>
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <Link
              href={`#${section.id}`}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeId === section.id
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              {section.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
