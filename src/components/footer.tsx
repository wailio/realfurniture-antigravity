'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Check, ArrowRight, MapPin, Phone, Mail } from 'lucide-react';
import { TikTokIcon } from '@/components/icons';
import { useSiteConfig } from '@/lib/use-site-config';

export function Footer() {
  const siteConfig = useSiteConfig();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleSubscribe = (e: React.FormEvent) => { e.preventDefault(); if (!email.trim()) return; setSubscribed(true); setEmail(''); };
  const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3198.5906046037494!2d3.060058575713971!3d36.70837457287061!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fad5fae229a89%3A0xa8afd38ca1b6e44f!2sCh%C3%A2teau%20D\u0027Art%20-%20meubles!5e0!3m2!1sfr!2sdz!4v1789588881010!5m2!1sfr!2sdz';
  return (
    <footer className='bg-[#0A0B0C] text-[#B7BBC0] font-sora border-t border-white/10'>
      {/* ── MOBILE FOOTER ── */}
      <div className='md:hidden'>
        <div className='px-5 pt-8 pb-6 border-b border-white/10 flex flex-col items-center text-center'>
          <Link href='/' className='inline-block mb-3'><img src='/logo.png' alt="Chateau d'art" className='h-12 w-auto object-contain' /></Link>
          <p className='text-[11px] text-[#A1A1AA] leading-relaxed max-w-xs'>Maison de mobilier et d&apos;art de vivre — l&apos;artisanat d&apos;exception &amp; les lignes contemporaines.</p>
          <div className='mt-4 flex flex-col gap-2 text-[11px]'>
            <a href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} className='flex items-center justify-center gap-2 text-white font-semibold'><Phone size={13} className='text-[#b68d40]' />{siteConfig.phone}</a>
            <a href={`mailto:${siteConfig.email}`} className='flex items-center justify-center gap-2 text-[#B7BBC0]'><Mail size={13} className='text-[#b68d40]' />{siteConfig.email}</a>
            <span className='flex items-center justify-center gap-2 text-[#B7BBC0]'><MapPin size={13} className='text-[#b68d40]' />{siteConfig.address} — {siteConfig.hours}</span>
          </div>
        </div>
        <div className='px-5 py-6 border-b border-white/10'>
          <span className='text-[9px] uppercase tracking-[3px] text-[#b68d40] font-bold block mb-1'>Club Privilege</span>
          <h3 className='text-white text-sm font-semibold mb-1'>Nouveautes &amp; Arrivages</h3>
          <p className='text-[11px] text-[#A1A1AA] mb-4'>Acces en avant-premiere a nos nouvelles creations.</p>
          {subscribed ? (
            <div className='p-3 bg-[#b68d40]/15 border border-[#b68d40]/30 text-white text-[11px] flex items-center gap-2'><Check className='w-4 h-4 text-[#b68d40] flex-shrink-0' /><span>Merci. Vous recevrez nos invitations.</span></div>
          ) : (
            <form onSubmit={handleSubscribe} className='flex gap-0'>
              <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='Votre email' className='flex-1 bg-[#121316] border border-white/15 border-r-0 px-3 py-2.5 text-[11px] text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#b68d40] transition-colors' />
              <button type='submit' className='bg-[#b68d40] hover:bg-[#a37c35] text-white px-4 py-2.5 flex-shrink-0 transition-colors'><ArrowRight size={13} /></button>
            </form>
          )}
        </div>
        <div className='px-5 py-6 border-b border-white/10 grid grid-cols-2 gap-4'>
          <div>
            <h4 className='text-white text-[11px] font-bold uppercase tracking-[2px] mb-3'>Explorer</h4>
            <ul className='space-y-2.5 text-[11px]'>
              <li><Link href='/all-products' className='hover:text-white transition-colors'>Tous les meubles</Link></li>
              <li><Link href='/rooms' className='hover:text-white transition-colors'>Par piece</Link></li>
              <li><Link href='/offers' className='hover:text-white transition-colors'>Offres</Link></li>
              <li><Link href='/inspirations' className='hover:text-white transition-colors'>Inspirations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className='text-white text-[11px] font-bold uppercase tracking-[2px] mb-3'>Maison</h4>
            <ul className='space-y-2.5 text-[11px]'>
              <li><Link href='/about' className='hover:text-white transition-colors'>Notre histoire</Link></li>
              <li><Link href='/contact' className='hover:text-white transition-colors'>Rendez-vous</Link></li>
              <li><Link href='/contact?subject=Devis' className='hover:text-white transition-colors'>Devis sur mesure</Link></li>
            </ul>
          </div>
        </div>
        <div className='border-b border-white/10'>
          <iframe title="Chateau d'art Maps" src={mapSrc} className='w-full h-40 grayscale brightness-[0.75] contrast-[1.1]' loading='lazy' referrerPolicy='strict-origin-when-cross-origin' />
        </div>
        <div className='px-5 py-5 border-b border-white/10 flex items-center justify-center gap-3'>
          <a href={siteConfig.instagram_url || 'https://www.instagram.com/chateau_dart_meubles/'} target='_blank' rel='noopener noreferrer' aria-label='Instagram' className='w-9 h-9 rounded-full bg-[#18191B] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-[#b68d40] hover:border-[#b68d40] transition-all'><Instagram size={15} /></a>
          <a href={siteConfig.facebook_url || 'https://www.facebook.com/chateau.dart.alger/'} target='_blank' rel='noopener noreferrer' aria-label='Facebook' className='w-9 h-9 rounded-full bg-[#18191B] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-[#b68d40] hover:border-[#b68d40] transition-all'><Facebook size={15} /></a>
          <a href={siteConfig.tiktok_url || 'https://www.tiktok.com/@chateaudart_meubles'} target='_blank' rel='noopener noreferrer' aria-label='TikTok' className='w-9 h-9 rounded-full bg-[#18191B] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-[#b68d40] hover:border-[#b68d40] transition-all'><TikTokIcon className='w-3.5 h-3.5' /></a>
          <a href={siteConfig.youtube_url || 'https://www.youtube.com/@chateaudart/featured'} target='_blank' rel='noopener noreferrer' aria-label='YouTube' className='w-9 h-9 rounded-full bg-[#18191B] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-[#b68d40] hover:border-[#b68d40] transition-all'><Youtube size={15} /></a>
        </div>
        <div className='px-5 py-4 flex flex-col items-center gap-2 text-[10px] text-[#71717A] text-center'>
          <p>&copy; 2026 Chateau d&apos;art. Tous droits reserves.</p>
          <div className='flex gap-4'>
            <Link href='/about' className='hover:text-white'>Mentions legales</Link>
            <Link href='/contact' className='hover:text-white'>Confidentialite</Link>
            <Link href='/contact' className='hover:text-white'>Service Client</Link>
          </div>
        </div>
      </div>
      {/* ── DESKTOP FOOTER ── */}
      <div className='hidden md:block py-24'>
        <div className='container mx-auto px-6 max-w-[1440px]'>
          <div className='pb-12 mb-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6'>
            <div>
              <Link href='/' className='inline-block mb-3 group'><img src='/logo.png' alt="Chateau d'art" className='h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md' /></Link>
              <p className='text-xs md:text-sm text-[#A1A1AA] max-w-lg leading-relaxed'>Maison de mobilier et d&apos;art de vivre. L&apos;alliance de l&apos;artisanat d&apos;exception et des lignes contemporaines.</p>
            </div>
            <span className='flex items-center gap-1.5 text-white text-xs'><span className='w-2 h-2 rounded-full bg-[#b68d40] animate-pulse' />Livraison dans les 58 wilayas</span>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.1fr_1.1fr_0.9fr_1fr] gap-8'>
            <div className='bg-[#121316] p-8 border border-white/10 flex flex-col justify-between'>
              <div><h3 className='text-white font-fraunces text-xl font-light mb-4'>L&apos;Atelier &amp; Showroom</h3><p className='text-xs md:text-sm text-[#A1A1AA] leading-relaxed mb-6'>Chaque creation Chateau d&apos;art est concue pour traverser le temps. Visitez notre showroom ou contactez nos conseillers.</p></div>
              <div className='space-y-2.5 text-xs text-[#D1D5DB] border-t border-white/10 pt-4'>
                <div className='flex items-center gap-2'><Phone size={14} className='text-[#b68d40]' /><a href={`tel:${siteConfig.phone.replace(/[^0-9]/g, '')}`} className='hover:text-white font-semibold'>{siteConfig.phone}</a></div>
                <div className='flex items-center gap-2'><Mail size={14} className='text-[#b68d40]' /><a href={`mailto:${siteConfig.email}`} className='hover:text-white'>{siteConfig.email}</a></div>
                <div className='flex items-center gap-2'><MapPin size={14} className='text-[#b68d40]' /><span>Showroom {siteConfig.address} — {siteConfig.hours}</span></div>
              </div>
            </div>
            <div className='bg-[#121316] p-8 border border-white/10 flex flex-col justify-between'>
              <div><span className='text-[11px] uppercase tracking-[3px] text-[#b68d40] font-bold block mb-2'>Club Privilege</span><h3 className='text-white font-fraunces text-xl font-light mb-3'>Nouveautes &amp; Arrivages</h3><p className='text-xs text-[#A1A1AA] leading-relaxed mb-6'>Acces en avant-premiere a nos nouvelles creations, series limitees et offres de saison.</p></div>
              {subscribed ? (
                <div className='p-4 rounded-md bg-[#b68d40]/15 border border-[#b68d40]/30 text-white text-xs flex items-center gap-2'><Check className='w-4 h-4 text-[#b68d40]' /><span>Merci. Vous recevrez nos invitations exclusives.</span></div>
              ) : (
                <form onSubmit={handleSubscribe} className='flex flex-col gap-3'>
                  <input type='email' value={email} onChange={(e) => setEmail(e.target.value)} required placeholder='Votre adresse email' className='w-full bg-[#0A0B0C] border border-white/15 px-4 py-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#b68d40] transition-colors' />
                  <button type='submit' className='w-full bg-[#b68d40] hover:bg-[#a37c35] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 group shadow-sm'><span>S&apos;inscrire</span><ArrowRight size={13} className='transition-transform duration-200 group-hover:translate-x-1' /></button>
                </form>
              )}
            </div>
            <div className='bg-[#121316] p-8 border border-white/10 flex flex-col justify-between'>
              <div><h3 className='text-white font-fraunces text-xl font-light mb-6 flex items-center gap-2'><span>Explorer</span><span className='w-6 h-[1px] bg-[#b68d40]' /></h3><ul className='space-y-3 text-xs md:text-sm'><li><Link href='/all-products' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Tous nos meubles</Link></li><li><Link href='/rooms' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Collections par piece</Link></li><li><Link href='/offers' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Offres privileges</Link></li><li><Link href='/inspirations' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Inspirations &amp; Lookbook</Link></li></ul></div>
              <div className='pt-4 border-t border-white/10 space-y-2.5'><div className='relative rounded-sm overflow-hidden border border-white/10 h-28 w-full'><iframe title="Maps" src={mapSrc} className='w-full h-full grayscale contrast-[1.1] brightness-[0.8] hover:grayscale-0 transition-all duration-500' loading='lazy' referrerPolicy='strict-origin-when-cross-origin' /></div><span className='text-[11px] text-[#A1A1AA] block'>Showroom {siteConfig.address} — {siteConfig.hours}</span></div>
            </div>
            <div className='bg-[#121316] p-8 border border-white/10 flex flex-col justify-between'>
              <div><h3 className='text-white font-fraunces text-xl font-light mb-6 flex items-center gap-2'><span>Maison</span><span className='w-6 h-[1px] bg-[#b68d40]' /></h3><ul className='space-y-3 text-xs md:text-sm mb-6'><li><Link href='/about' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Notre histoire &amp; savoir-faire</Link></li><li><Link href='/contact' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Prendre rendez-vous</Link></li><li><Link href='/contact?subject=Devis' className='hover:text-white inline-block hover:translate-x-1 duration-200'>Demande de devis sur mesure</Link></li></ul></div>
              <div><span className='text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-3'>Reseaux Officiels</span><div className='flex gap-2.5'><a href={siteConfig.instagram_url || 'https://www.instagram.com/chateau_dart_meubles/'} target='_blank' rel='noopener noreferrer' aria-label='Instagram' className='w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200'><Instagram size={16} /></a><a href={siteConfig.facebook_url || 'https://www.facebook.com/chateau.dart.alger/'} target='_blank' rel='noopener noreferrer' aria-label='Facebook' className='w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200'><Facebook size={16} /></a><a href={siteConfig.tiktok_url || 'https://www.tiktok.com/@chateaudart_meubles'} target='_blank' rel='noopener noreferrer' aria-label='TikTok' className='w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200'><TikTokIcon className='w-4 h-4' /></a><a href={siteConfig.youtube_url || 'https://www.youtube.com/@chateaudart/featured'} target='_blank' rel='noopener noreferrer' aria-label='YouTube' className='w-9 h-9 rounded-md bg-[#1A1C20] border border-white/10 flex items-center justify-center text-[#B7BBC0] hover:text-white hover:border-[#b68d40] hover:bg-[#b68d40]/10 transition-all duration-200'><Youtube size={16} /></a></div></div>
            </div>
          </div>
          <div className='mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-[#71717A] gap-4'>
            <p>&copy; 2026 Chateau d&apos;art. Tous droits reserves.</p>
            <div className='flex gap-6'><Link href='/about' className='hover:text-white'>Mentions legales</Link><Link href='/contact' className='hover:text-white'>Confidentialite</Link><Link href='/contact' className='hover:text-white'>Service Client</Link></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
