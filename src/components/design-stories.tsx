'use client';

import React from 'react';
import { Instagram, Facebook, Youtube, ArrowUpRight } from 'lucide-react';
import { LuxuryReveal } from '@/components/luxury-reveal';

function TikTokIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-.88-.06 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.28 8.28 0 0 0 4.77 1.5V6.8a4.83 4.83 0 0 1-1-.11Z" />
    </svg>
  );
}

interface StoryItem {
  id: string;
  name: string;
  handle: string;
  video: string;
  icon: React.ComponentType<{ className?: string }>;
  link: string;
}

const stories: StoryItem[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@mfmeubles',
    video: '/videos/instagram-vd.mp4',
    icon: Instagram,
    link: 'https://www.instagram.com/mfmeubles/',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: '@mfmeubles',
    video: '/videos/facebook-vd.mp4',
    icon: Facebook,
    link: 'https://www.facebook.com/profile.php?id=100063579698712&locale=fr_FR',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@mfmeubleskouba',
    video: '/videos/tiktok-vd.mp4',
    icon: TikTokIcon,
    link: 'https://www.tiktok.com/@mfmeubleskouba',
  },
  {
    id: 'reviews',
    name: 'Avis Google',
    handle: 'M&F Meubles · Kouba',
    video: '/videos/youtube-vd.mp4',
    icon: Youtube,
    link: 'https://maps.app.goo.gl/PgX4a88fpg7dPQkFA',
  },
];

export function DesignStories() {
  return (
    <section className="relative w-full py-20 md:py-28 bg-[#FAFAFA] border-t border-neutral-200/80 overflow-hidden font-sans">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with badge */}
        <div className="text-center mb-12 md:mb-16">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-2 border border-neutral-200 bg-white px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider text-neutral-800 mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
              <span>Réseaux &amp; Coulisses</span>
            </div>
          </LuxuryReveal>
          <LuxuryReveal>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-sans font-extrabold text-[#111827] tracking-tight leading-tight">
              Nos Réalisations en <span className="font-serif italic font-light text-neutral-600">Mouvement</span>
            </h2>
          </LuxuryReveal>
        </div>

        {/* 4 Story Video Cards Container with tight vertical padding */}
        <div className="relative">
          <div className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible gap-5 lg:gap-6 pb-2 pt-1 px-1 sm:px-2 lg:px-0 snap-x snap-mandatory scrollbar-hide">
            {stories.map((story, idx) => {
              const IconComponent = story.icon;
              return (
                <LuxuryReveal 
                  key={story.id} 
                  delay={idx * 80}
                  className="shrink-0 snap-center w-[260px] sm:w-[285px] lg:w-auto"
                >
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir nos créations sur ${story.name}`}
                    className="story-item group relative block h-[420px] sm:h-[460px] lg:h-[500px] w-full rounded-[24px] overflow-hidden border border-neutral-200/90 hover:border-neutral-400 transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.12)] bg-neutral-100"
                  >
                    {/* Background Video */}
                    <video
                      src={story.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30 pointer-events-none" />

                    {/* Top Platform Tag */}
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-[11px] text-neutral-900 font-semibold shadow-sm">
                        <IconComponent className="w-3.5 h-3.5 text-neutral-900" />
                        <span>{story.name}</span>
                      </span>
                    </div>

                    {/* Center Animated Pop-up Social Icon (Apple hover tactile button) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="w-13 h-13 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-xl transform scale-0 group-hover:scale-100 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Metadata — text directly on video */}
                    <div className="absolute bottom-7 left-4 right-4 z-10 flex items-end justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] uppercase tracking-widest text-white/60 font-semibold block mb-0.5">
                          {story.name}
                        </span>
                        <p className="text-sm font-semibold text-white truncate">
                          {story.handle}
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-neutral-900 transition-all duration-300">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </a>
                </LuxuryReveal>
              );
            })}
          </div>

          {/* Subtle Mobile Swipe Hint */}
          <div className="flex lg:hidden justify-center items-center gap-1.5 mt-2 text-[11px] text-neutral-400">
            <span>Glissez pour voir plus</span>
            <span>&rarr;</span>
          </div>
        </div>

      </div>
    </section>
  );
}
