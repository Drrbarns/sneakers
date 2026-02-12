'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import PageHero from '@/components/PageHero';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AboutPage() {
usePageTitle('About Adjetman Sneakers – Your Trusted Sneakers & Streetwear Store');
  const { getSetting } = useCMS();
  const [activeTab, setActiveTab] = useState('story');

  const siteName = getSetting('site_name') || 'Adjetman Sneakers';
  const primaryColor = getSetting('primary_color') || '#059669';

  // CMS-driven content
  const heroTitle =
    getSetting('about_hero_title') ||
    'More than sneakers, it’s a lifestyle plug';
  const heroSubtitle =
    getSetting('about_hero_subtitle') ||
    'Adjetman Sneakers is your trusted source for real sneakers and everyday pieces that keep your style sharp from head to toe.';
  const storyTitle =
    getSetting('about_story_title') || 'From sneaker passion to Adjetman Sneakers';
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
    getSetting('about_values_title') || 'Why shop sneakers with us?';
  const valuesSubtitle =
    getSetting('about_values_subtitle') ||
    'Sneaker-first curation, honest pricing and pieces that actually last.';
  const ctaTitle =
    getSetting('about_cta_title') ||
    'Ready to step into better sneakers?';
  const ctaSubtitle =
    getSetting('about_cta_subtitle') ||
    'Discover curated sneakers, slides, Crocs, Birkenstock, bags, watches, belts, tops, jeans and socks – all in one place.';

  // Story paragraphs (split by newlines)
  const storyParagraphs = storyContent.split('\n').filter((p: string) => p.trim());

  const values = [
    {
      icon: 'ri-verified-badge-line',
      title: 'Authentic products only',
      description:
        'Every sneaker, slide, Crocs pair and accessory is sourced from trusted partners. No fakes, no shortcuts – just real quality you can feel.'
    },
    {
      icon: 'ri-money-dollar-circle-line',
      title: 'Sneaker-first value',
      description:
        'We focus our budget on the parts that matter most – better materials, better comfort and better designs – while keeping prices fair.'
    },
    {
      icon: 'ri-star-smile-line',
      title: 'Built to be worn',
      description:
        'From cushioning and grip on sneakers to the feel of your tops, jeans and socks, everything is chosen to handle real, everyday wear.'
    },
    {
      icon: 'ri-group-line',
      title: 'Community-driven choices',
      description:
        'We listen to what our customers actually wear – from popular sneaker silhouettes to must-have bags and accessories – and stock more of what you love.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex border-b border-gray-200 mb-12 justify-center">
          <button
            onClick={() => setActiveTab('story')}
            className={`px-8 py-4 font-medium transition-colors text-lg cursor-pointer ${activeTab === 'story'
              ? 'text-emerald-700 border-b-4 border-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Our Story
          </button>
          <button
            onClick={() => setActiveTab('mission')}
            className={`px-8 py-4 font-medium transition-colors text-lg cursor-pointer ${activeTab === 'mission'
              ? 'text-emerald-700 border-b-4 border-emerald-700 font-bold'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Our Mission
          </button>
        </div>

        {activeTab === 'story' && (
          <div className="grid md:grid-cols-2 gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">{storyTitle}</h2>
              <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                {storyParagraphs.length > 0 ? (
                  storyParagraphs.map((p: string, i: number) => <p key={i}>{p}</p>)
                ) : (
                  <>
                    <p>
                      Our journey started with a simple vision: build a store where the sneakers come first – and everything else is chosen to match them.
                    </p>
                    <p>
                      At <strong>{siteName}</strong>, we hand-pick premium sneakers and then complete the look with slides, Crocs, Birkenstock, side bags, backpacks, watches, belts, tops, jeans and socks, so every order feels like a full fit, not just a pair of shoes.
                    </p>
                    <p>
                      What began as a love for kicks has grown into a trusted plug for people who want authentic style, everyday comfort and fair prices.
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl bg-gray-100 relative">
                <img
                  src={storyImage}
                  alt={`${founderName} - ${founderTitle}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                  <p className="text-white font-bold text-xl">{founderName}</p>
                  <p className="text-emerald-200">{founderTitle}</p>
                </div>
              </div>
              {/* Decorative Element */}
              <div className="absolute -z-10 top-10 -right-10 w-full h-full border-4 border-emerald-100 rounded-2xl hidden md:block"></div>
            </div>
          </div>
        )}

        {activeTab === 'mission' && (
          <div className="grid md:grid-cols-2 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-emerald-50 p-10 rounded-3xl border border-emerald-100">
              <div className="w-16 h-16 bg-emerald-700 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <i className="ri-plane-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{mission1Title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {mission1Content ||
                  'We build every collection from the sneakers up. Classic pairs, everyday beaters and statement kicks are the heart of Adjetman Sneakers – everything else in the store is chosen to make those sneakers look and feel even better.'}
              </p>
            </div>
            <div className="bg-amber-50 p-10 rounded-3xl border border-amber-100">
              <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
                <i className="ri-heart-line text-3xl text-white"></i>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">{mission2Title}</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {mission2Content ||
                  'We don’t just stop at sneakers. Slides, Crocs, Birkenstock, side bags, backpacks, watches, belts, tops, jeans and socks are all curated to work together, so you can build full outfits around your kicks without overthinking it.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Values Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{valuesTitle}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{valuesSubtitle}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                  <i className={`${value.icon} text-2xl text-emerald-700`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-emerald-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">{ctaTitle}</h2>
          <p className="text-xl text-emerald-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            {ctaSubtitle}
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 bg-white text-emerald-900 px-10 py-5 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
          >
            Start Shopping
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
