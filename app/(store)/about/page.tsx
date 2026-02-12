'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
  usePageTitle('About Adjetman Sneakers – Your Trusted Sneakers & Streetwear Store');
  const { getSetting } = useCMS();
  const [activeTab, setActiveTab] = useState<'story' | 'mission'>('story');

  const siteName = getSetting('site_name') || 'Adjetman Sneakers';

  const heroTitle =
    getSetting('about_hero_title') ||
    'More than sneakers — it’s your style plug';
  const heroSubtitle =
    getSetting('about_hero_subtitle') ||
    'We’re here to bring you authentic sneakers and everyday pieces that look good on the streets of Accra and beyond.';
  const storyTitle =
    getSetting('about_story_title') || 'From sneaker passion to your go-to store';
  const storyContent = getSetting('about_story_content') || '';
  const storyImage = getSetting('about_story_image') || '/about.jpg';
  const founderName = getSetting('about_founder_name') || 'Founder';
  const founderTitle = getSetting('about_founder_title') || 'CEO';
  const mission1Title =
    getSetting('about_mission1_title') || 'Sneaker-first selection';
  const mission1Content = getSetting('about_mission1_content') || '';
  const mission2Title =
    getSetting('about_mission2_title') || 'Complete the fit, head to toe';
  const mission2Content = getSetting('about_mission2_content') || '';
  const valuesTitle =
    getSetting('about_values_title') || 'Why shop with us';
  const valuesSubtitle =
    getSetting('about_values_subtitle') ||
    'Authentic product, fair prices, and pieces built for real life.';

  const storyParagraphs = storyContent.split('\n').filter((p: string) => p.trim());

  const values = [
    {
      icon: 'ri-verified-badge-line',
      title: 'Authentic only',
      description:
        'Every sneaker and accessory comes from trusted sources. No fakes — just quality you can feel and wear with confidence.',
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Fair value',
      description:
        'We invest in better materials and comfort while keeping prices honest so more people can step up their style.',
    },
    {
      icon: 'ri-star-smile-line',
      title: 'Built to be worn',
      description:
        'From cushioning and grip to fit and durability, everything we stock is chosen for everyday wear in real conditions.',
    },
    {
      icon: 'ri-group-line',
      title: 'Community-first',
      description:
        'We listen to what you actually wear and restock the silhouettes and styles that keep selling out.',
    },
  ];

  const defaultStory = (
    <>
      <p>
        Our story started with a simple idea: a place where sneakers come first, and everything else is chosen to match.
      </p>
      <p>
        At <strong>{siteName}</strong>, we handpick premium sneakers and then complete the look with slides, Crocs, bags, watches, belts, tops, jeans and socks — so every order feels like a full fit, not just a pair of shoes.
      </p>
      <p>
        What began as a love for kicks has grown into a trusted plug for people who want authentic style, everyday comfort and fair prices across Ghana.
      </p>
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="flex border-b border-emerald-100 mb-10 sm:mb-12 justify-center gap-0">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-6 sm:px-8 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base cursor-pointer border-b-2 -mb-px ${
              activeTab === 'story'
                ? 'text-emerald-700 border-emerald-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700 border-transparent'
            }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-6 sm:px-8 py-3 sm:py-4 font-medium transition-colors text-sm sm:text-base cursor-pointer border-b-2 -mb-px ${
              activeTab === 'mission'
                ? 'text-emerald-700 border-emerald-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700 border-transparent'
            }`}
          >
            Our Mission
          </button>
        </div>

        {activeTab === 'story' && (
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2">
                Our story
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-6">
                {storyTitle}
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm sm:text-base">
                {storyParagraphs.length > 0
                  ? storyParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                  : defaultStory}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 border border-emerald-50">
                <img
                  src={storyImage}
                  alt={`${founderName} - ${founderTitle}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <p className="text-white font-bold text-lg sm:text-xl">{founderName}</p>
                  <p className="text-emerald-200 text-sm">{founderTitle}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="relative overflow-hidden rounded-2xl border border-emerald-50 bg-emerald-50/40 p-6 sm:p-8">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-emerald-200/40 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                  <i className="ri-plane-line text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {mission1Title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {mission1Content ||
                    'We build every collection from the sneakers up. Classic pairs, everyday beaters and statement kicks are the heart of Adjetman Sneakers — everything else is chosen to make those sneakers look and feel even better.'}
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/40 p-6 sm:p-8">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/40 blur-2xl pointer-events-none" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md">
                  <i className="ri-heart-line text-2xl" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  {mission2Title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                  {mission2Content ||
                    'We don’t just stop at sneakers. Slides, Crocs, Birkenstock, bags, watches, belts, tops, jeans and socks are all curated to work together so you can build full outfits around your kicks without overthinking it.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Values — match homepage "Why customers stay" */}
      <section className="bg-white py-10 sm:py-14 border-t border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase">
              Why Adjetman
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              {valuesTitle}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              {valuesSubtitle}
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <div
                key={index}
                className="relative overflow-hidden rounded-2xl border border-emerald-50 bg-emerald-50/40 p-6"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-200/40 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <i className={`${value.icon} text-xl`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center rounded-full bg-emerald-600 text-white px-8 py-3 text-sm font-semibold hover:bg-emerald-700 transition-colors"
            >
              Shop sneakers
              <i className="ri-arrow-right-line ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
