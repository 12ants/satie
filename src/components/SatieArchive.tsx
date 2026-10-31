import React from 'react';
import { SATIE_WRITINGS, SATIE_APHORISMS } from '../data/writings.ts';
import satiePortrait from '../assets/images/satie_portrait_1793460129506.jpg';
import satieStudio from '../assets/images/satie_studio_1793460144455.jpg';

export const SatieArchive: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Editorial Header */}
      <div className="border-b border-[#2a2622] pb-6">
        <div className="flex items-center gap-2 text-xs font-serif italic tracking-widest text-[#a69784] uppercase">
          <span>Archives & Documents</span>
          <span aria-hidden="true">·</span>
          <span>The Master of Arcueil</span>
        </div>
        <h2 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#f3efe6]">
          Memoirs, Paradoxes & Writings
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#b5a999]">
          Secret dandy, Dadaist forerunner, and solitary genius, Erik Satie revolutionized art as much through his sharp aphorisms and poetic wit as through his uncluttered harmonies.
        </p>
      </div>

      {/* Featured Archival Dual Spread: Portrait and Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Portrait and biographical essay */}
        <div className="lg:col-span-5 rounded-2xl border border-[#2b2723] bg-[#161413] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-[#332c25] bg-[#1c1917]">
              <img
                src={satiePortrait}
                alt="Archival portrait photograph of Erik Satie with pince-nez and bowler hat"
                className="w-full h-80 object-cover object-top hover:scale-102 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs font-serif tracking-widest text-[#a69784] uppercase">
                Arcueil · 1866 — 1925
              </span>
              <h3 className="font-serif text-2xl font-medium text-[#f3efe6] mt-1">
                The "Velvet Gentleman"
              </h3>
              <p className="text-xs leading-relaxed text-[#9c9081] mt-2">
                For twenty-seven years, Satie lived as a recluse at 22 rue Cauchy in Arcueil, in a small room no visitor was ever permitted to enter during his lifetime. Upon his death, his closest friends discovered over a hundred pristine umbrellas, twelve identical chestnut-velvet suits, and stacks of uncataloged manuscripts hidden behind two upright pianos tied together.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#2a2622] text-xs font-serif italic text-[#c4a984]">
            “Experience is a form of paralysis.”
          </div>
        </div>

        {/* Right Column: Studio garret and daily schedule */}
        <div className="lg:col-span-7 rounded-2xl border border-[#2b2723] bg-[#161413] p-6 flex flex-col justify-between space-y-6">
          <div className="overflow-hidden rounded-xl border border-[#332c25] bg-[#1c1917]">
            <img
              src={satieStudio}
              alt="Parisian attic garret studio with upright piano in rain"
              className="w-full h-64 object-cover hover:scale-102 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Satie's timetable from Memoirs of an Amnesiac */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#a69784]">
              <span className="font-serif uppercase tracking-wider">Literary Excerpt</span>
              <span className="font-mono">SIM, 1913</span>
            </div>
            <h4 className="font-serif text-xl font-medium text-[#f3efe6]">
              A Day in the Life of a Musician
            </h4>
            <div className="rounded-xl bg-[#1e1b18] border border-[#2e2924] p-4 text-xs font-serif leading-relaxed text-[#ded8cd] space-y-2">
              <p className="italic">
                “An artist must regulate his life. Rise: at 7:18 a.m. Inspiration: from 10:23 to 11:47 a.m. Lunch: at 12:11 p.m., leaving table at 12:14 p.m. Salutary horseback ride: from 1:19 to 2:53 p.m. Another inspiration: from 3:12 to 4:07 p.m. Fencing: from 5:00 to 6:47 p.m. (out of a sense of justice). Bedtime: at 10:37 p.m. sharp.”
              </p>
              <p className="text-[11px] text-[#8e8273]">
                — Memoirs of an Amnesiac (Mémoires d’un amnésique)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Famous Writings & Tracts */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-medium text-[#f3efe6]">
          Selected Writings & Manifestos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SATIE_WRITINGS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-[#26221e] bg-[#161413] p-5 space-y-3"
            >
              <div className="flex items-center justify-between text-xs text-[#8e8273]">
                <h4 className="font-serif text-base font-medium text-[#ded8cd]">
                  {item.title}
                </h4>
                {item.year && <span className="font-mono">{item.year}</span>}
              </div>

              <blockquote className="font-serif text-xs italic leading-relaxed text-[#c4a984]/90 pl-3 border-l border-[#594d3e]">
                “{item.englishTranslation}”
              </blockquote>

              <p className="text-xs leading-relaxed text-[#9e9282] italic">
                « {item.frenchQuote} »
              </p>

              <div className="pt-2 text-[11px] font-mono text-[#665e53]">
                Source: {item.source}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aphorisms Strip */}
      <div className="rounded-xl border border-[#2b2723] bg-[#171514] p-6 space-y-4">
        <h4 className="font-serif text-lg font-medium text-[#f3efe6]">
          Aphorisms & Wit
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-serif italic text-[#c4a984]">
          {SATIE_APHORISMS.map((aphorism, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-[#1f1c19] border border-[#2a2622]">
              {aphorism}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
