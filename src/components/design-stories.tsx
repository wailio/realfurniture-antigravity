'use client';

import React from 'react';
import Link from 'next/link';
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
    handle: '@chateau_dart_meubles',
    video: '/videos/instagram-vd.mp4',
    icon: Instagram,
    link: 'https://www.instagram.com/chateau_dart_meubles/',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    handle: '@chateau.dart.alger',
    video: '/videos/facebook-vd.mp4',
    icon: Facebook,
    link: 'https://www.facebook.com/chateau.dart.alger/',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    handle: '@chateaudart_meubles',
    video: '/videos/tiktok-vd.mp4',
    icon: TikTokIcon,
    link: 'https://www.tiktok.com/@chateaudart_meubles',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@chateaudart',
    video: '/videos/youtube-vd.mp4',
    icon: Youtube,
    link: 'https://www.youtube.com/@chateaudart/featured',
  },
];

export function DesignStories() {
  return (
    <section className="relative w-full py-20 md:py-32 bg-[#0E0F10] border-t border-white/10 overflow-hidden font-sora">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center mb-14 md:mb-20">
          <LuxuryReveal>
            <div className="inline-flex items-center gap-2 border border-white/15 bg-white/5 px-4 py-1.5 rounded-none text-xs font-medium tracking-wider text-[#b68d40] mb-4 shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#b68d40]" />
              <span>Design Stories</span>
            </div>
            
            <h2 className="font-fraunces font-light text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-tight leading-tight">
              Modern Living Inspirations
            </h2>
          </LuxuryReveal>
        </div>

        {/* 4 Story Video Shapes Container (Sideways scrollable on mobile, 4-col grid on desktop) */}
        <div className="relative">
          <div className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible gap-5 lg:gap-6 pb-6 pt-2 px-2 sm:px-4 lg:px-0 snap-x snap-mandatory scrollbar-hide">
            {stories.map((story, idx) => {
              const IconComponent = story.icon;
              return (
                <LuxuryReveal 
                  key={story.id} 
                  delay={idx * 100}
                  className="shrink-0 snap-center w-[250px] sm:w-[285px] lg:w-auto"
                >
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Voir nos créations sur ${story.name}`}
                    className="story-item group relative block h-[400px] sm:h-[450px] lg:h-[510px] w-full rounded-[24px] overflow-hidden border border-white/10 hover:border-[#b68d40]/60 transition-all duration-500 shadow-2xl bg-[#141518]"
                  >
                    {/* Background Video */}
                    <video
                      src={story.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 transition-opacity duration-500 group-hover:opacity-90 pointer-events-none" />

                    {/* Subtle Gold Tint Hover Overlay */}
                    <div className="absolute inset-0 bg-[#b68d40]/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    {/* Top Platform Tag */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/15 text-[11px] text-[#F2F1EF] font-medium tracking-wide">
                        <IconComponent className="w-3.5 h-3.5 text-[#b68d40]" />
                        <span>{story.name}</span>
                      </span>
                    </div>

                    {/* Center Animated Pop-up Social Icon (Livora style) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                      <div className="w-14 h-14 rounded-full bg-[#b68d40] text-white flex items-center justify-center shadow-[0_10px_30px_rgba(182,141,64,0.6)] transform scale-0 group-hover:scale-100 transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:shadow-[0_14px_35px_rgba(182,141,64,0.85)]">
                        <IconComponent className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                      </div>
                    </div>

                    {/* Bottom Metadata & CTA */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10 flex items-end justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-[2px] text-[#b68d40] font-semibold block mb-0.5">
                          {story.name}
                        </span>
                        <p className="font-fraunces text-base sm:text-lg text-white font-normal line-clamp-1">
                          {story.handle}
                        </p>
                      </div>

                      <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white transition-all duration-300 group-hover:bg-[#b68d40] group-hover:border-[#b68d40] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </a>
                </LuxuryReveal>
              );
            })}
          </div>

          {/* Subtle Mobile Swipe Hint */}
          <div className="flex lg:hidden justify-center items-center gap-1.5 mt-2 text-[11px] text-[#A1A1AA]">
            <span>Glissez pour découvrir</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* Bottom Banner (Matching Reference) */}
        <LuxuryReveal delay={300}>
          <div className="mt-14 md:mt-18 text-center flex flex-wrap items-center justify-center gap-2.5 text-xs md:text-sm text-[#A1A1AA]">
            <span className="px-2.5 py-0.5 rounded-full bg-[#b68d40] text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
              Devis
            </span>
            <span>Donnons vie à vos plus beaux projets d&apos;intérieur.</span>
            <Link 
              href="/contact" 
              className="font-bold underline text-white hover:text-[#b68d40] transition-colors ml-1 inline-flex items-center gap-1"
            >
              <span>Demander un devis gratuit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </LuxuryReveal>

      </div>
    </section>
  );
}
