 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { useCMS } from '@/context/CMSContext';
import ProductCard, {
  type ColorVariant,
  getColorHex,
} from '@/components/ProductCard';
import AnimatedSection, { AnimatedGrid } from '@/components/AnimatedSection';
import { usePageTitle } from '@/hooks/usePageTitle';
import heroSneakerImg from '../../cc865524879023ad80ead9ec87c8e0eec2b66dc8.png';
import bannerSneakerImg from '../../ad9048e4060aae008ec4a17cfe2d9bdb52f58f97.png';

export default function Home() {
  usePageTitle('');
  const { getSetting, getActiveBanners } = useCMS();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*, product_variants(*), product_images(*)')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(12);

        if (productsError) throw productsError;
        setFeaturedProducts(productsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // ── CMS-driven config with sensible fallbacks ─────────────────────
  const heroHeadline =
    getSetting('hero_headline') || 'Walk with style, step with confidence';
  const heroSubheadline =
    getSetting('hero_subheadline') ||
    'Discover the perfect blend of comfort, style and quality. Our exclusive collections are designed to elevate your look and support every step.';
  const heroImage = heroSneakerImg;
  const heroPrimaryText = getSetting('hero_primary_btn_text') || 'Shop Now';
  const heroPrimaryLink = getSetting('hero_primary_btn_link') || '/shop';
  const heroSecondaryText =
    getSetting('hero_secondary_btn_text') || 'Browse Shoes';
  const heroSecondaryLink = getSetting('hero_secondary_btn_link') || '/shop';

  const activeBanners = getActiveBanners('top');

  const renderBanners = () => {
    if (activeBanners.length === 0) return null;
    return (
      <div className="bg-emerald-900 text-white py-2 overflow-hidden relative">
        <div className="flex animate-marquee whitespace-nowrap">
          {activeBanners.concat(activeBanners).map((banner, index) => (
            <span
              key={index}
              className="mx-8 text-sm font-medium tracking-wide flex items-center"
            >
              {banner.title}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const popularProducts = featuredProducts.slice(0, 6);
  const latestProducts = featuredProducts;

  return (
    <main className="flex-col items-center justify-between min-h-screen bg-white">
      {renderBanners()}

      {/* Hero – Adjetman Sneakers */}
      <section className="relative w-full bg-hero-grid text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid gap-10 lg:grid-cols-2 items-center">
          {/* Left: copy */}
          <div className="space-y-6 max-w-xl">
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/20 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]">
              Adjetman Sneakers · New drops in
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.1rem] font-extrabold leading-tight">
              {heroHeadline}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/85">
              {heroSubheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href={heroPrimaryLink}
                className="btn-animate inline-flex items-center justify-center rounded-full bg-[#FBBF24] px-9 py-3 text-sm sm:text-base font-semibold text-gray-900 shadow-[0_14px_30px_rgba(0,0,0,0.35)] hover:bg-[#f59e0b] transition-colors"
              >
                {heroPrimaryText}
                <i className="ri-arrow-right-up-line ml-2 text-base" />
              </Link>
              <Link
                href={heroSecondaryLink}
                className="btn-animate inline-flex items-center justify-center rounded-full border border-white/40 px-9 py-3 text-sm sm:text-base font-semibold text-white/95 hover:bg-white hover:text-gray-900 transition-colors"
              >
                {heroSecondaryText}
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-xs sm:text-sm text-white/80">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <i className="ri-shield-check-line text-emerald-200" />
                </span>
                <span className="font-medium">100% authentic sneakers only</span>
              </div>
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/10">
                  <i className="ri-truck-line text-emerald-200" />
                </span>
                <span className="font-medium">Same‑day delivery in Accra</span>
              </div>
            </div>
          </div>

          {/* Right: hero shoe card */}
          <div className="relative w-full max-w-xl mx-auto">
            <div className="absolute -inset-8 bg-gradient-to-br from-emerald-300/20 via-emerald-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="relative rounded-[32px] bg-[#064E3B] p-5 sm:p-7 shadow-2xl overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80">
                    Featured drop
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white/90">
                    Everyday comfort · Street approved
                  </p>
                </div>
                <span className="rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-medium">
                  From GH₵{(popularProducts[0]?.price ?? 249).toFixed(0)}
                </span>
              </div>

              <div className="relative aspect-[4/3] rounded-3xl bg-emerald-900/40 overflow-hidden">
                <Image
                  src={
                    popularProducts[0]?.product_images?.[0]?.url ?? heroImage
                  }
                  alt={popularProducts[0]?.name || 'Hero sneaker'}
                  fill
                  className="object-contain object-center drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
                  sizes="(min-width: 1024px) 420px, 90vw"
                />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-white/90">
                <div>
                  <p className="font-semibold">
                    {popularProducts[0]?.name || 'Signature daily beater'}
                  </p>
                  <p className="text-xs text-emerald-200/80">
                    Lightweight · Cushioned · Street ready
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-emerald-200/80">From</p>
                  <p className="text-lg font-bold">
                    GH₵{(popularProducts[0]?.price ?? 249).toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick category shortcuts */}
      <AnimatedSection className="bg-white py-10 border-b border-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase">
                Shop by vibe
              </p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">
                Find your next daily pair
              </h2>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center text-sm font-medium text-emerald-700 hover:text-emerald-900"
            >
              Browse full catalogue
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: 'Sneakers',
                href: '/shop?category=sneakers',
                chip: 'Hot right now',
                icon: 'ri-run-line',
                color: 'from-emerald-500 to-emerald-700',
              },
              {
                label: 'Slides & Crocs',
                href: '/shop?category=slides-crocs',
                chip: 'Easy wear',
                icon: 'ri-footprint-line',
                color: 'from-sky-400 to-cyan-600',
              },
              {
                label: 'Bags & Accessories',
                href: '/shop?category=bags-accessories',
                chip: 'Carry the drip',
                icon: 'ri-handbag-line',
                color: 'from-amber-400 to-orange-600',
              },
              {
                label: 'Tops & Jeans',
                href: '/shop?category=apparel',
                chip: 'Complete the fit',
                icon: 'ri-t-shirt-2-line',
                color: 'from-slate-600 to-slate-900',
              },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative overflow-hidden rounded-2xl border border-emerald-50 bg-emerald-50/40 p-4 hover:border-emerald-300 transition-colors"
              >
                <div
                  className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${item.color} opacity-70 blur-2xl group-hover:opacity-100 transition-opacity`}
                />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-emerald-700 mb-2">
                      {item.chip}
                    </span>
                    <p className="text-sm font-semibold text-gray-900">
                      {item.label}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-emerald-700 group-hover:translate-y-[-2px] group-hover:shadow-md transition-all">
                    <i className={`${item.icon} text-lg`} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Trending sneakers grid */}
      <AnimatedSection className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase">
                Trending now
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-gray-900">
                Pairs everyone is asking for
              </h2>
            </div>
            <Link
              href="/shop?sort=bestsellers"
              className="inline-flex items-center text-sm font-medium text-gray-800 hover:text-emerald-700"
            >
              View all bestsellers
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[4/5] rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.map((product) => {
                const variants = product.product_variants || [];
                const hasVariants = variants.length > 0;
                const minVariantPrice = hasVariants
                  ? Math.min(
                      ...variants.map((v: any) => v.price || product.price)
                    )
                  : undefined;
                const totalVariantStock = hasVariants
                  ? variants.reduce(
                      (sum: number, v: any) => sum + (v.quantity || 0),
                      0
                    )
                  : 0;
                const effectiveStock = hasVariants
                  ? totalVariantStock
                  : product.quantity;

                const colorVariants: ColorVariant[] = [];
                const seenColors = new Set<string>();
                for (const v of variants) {
                  const colorName = (v as any).option2;
                  if (
                    colorName &&
                    !seenColors.has(colorName.toLowerCase().trim())
                  ) {
                    const hex = getColorHex(colorName);
                    if (hex) {
                      seenColors.add(colorName.toLowerCase().trim());
                      colorVariants.push({ name: colorName.trim(), hex });
                    }
                  }
                }

                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.compare_at_price}
                    image={
                      product.product_images?.[0]?.url ||
                      'https://via.placeholder.com/400x500'
                    }
                    rating={product.rating_avg || 5}
                    reviewCount={product.review_count || 0}
                    badge={product.featured ? 'Featured' : 'Trending'}
                    inStock={effectiveStock > 0}
                    maxStock={effectiveStock || 50}
                    moq={product.moq || 1}
                    hasVariants={hasVariants}
                    minVariantPrice={minVariantPrice}
                    colorVariants={colorVariants}
                  />
                );
              })}
            </AnimatedGrid>
          )}
        </div>
      </AnimatedSection>

      {/* New drops carousel */}
      <AnimatedSection className="bg-emerald-50/60 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-700 uppercase">
                Just landed
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-950">
                Fresh pairs & restocks
              </h2>
            </div>
            <p className="text-sm text-emerald-900/80 max-w-md">
              Scoop the freshest colorways before they sell out. Perfect for
              campus, events and everyday runs around town.
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-emerald-300/70 scrollbar-track-transparent">
            {(latestProducts.length ? latestProducts : popularProducts).map(
              (product) => (
                <div
                  key={product.id}
                  className="min-w-[220px] max-w-[260px] flex-shrink-0 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-emerald-900/5">
                    <Image
                      src={
                        product.product_images?.[0]?.url ||
                        'https://via.placeholder.com/400x500'
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs uppercase tracking-wide text-emerald-500 mb-1">
                      New drop
                    </p>
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        GH₵{Number(product.price || 0).toFixed(2)}
                      </span>
                      <Link
                        href={`/product/${product.slug}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
                      >
                        <i className="ri-arrow-right-line" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </AnimatedSection>

      {/* Why shop with Adjetman Sneakers */}
      <AnimatedSection className="bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase">
              Why customers stay with us
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900">
              Built by sneaker lovers, for everyday wearers
            </h2>
            <p className="mt-3 text-sm sm:text-base text-gray-600">
              From first‑time buyers to seasoned collectors, we make sure every
              pair that leaves our store is the right fit, right size and right
              vibe for you.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: 'ri-vip-crown-line',
                title: 'Curated heat, not clutter',
                body: 'We handpick silhouettes that actually look good on‑feet in Ghanaian streets, not just on social media.',
              },
              {
                icon: 'ri-customer-service-2-line',
                title: 'Real humans, real advice',
                body: 'Chat our team for sizing help, outfit ideas and honest recommendations before you check out.',
              },
              {
                icon: 'ri-bus-2-line',
                title: 'Fast delivery & easy swaps',
                body: 'Same‑day options in Accra, safe nationwide shipping and a smooth process if you need to change sizes.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="relative overflow-hidden rounded-2xl border border-emerald-50 bg-emerald-50/40 p-6"
              >
                <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-emerald-200/40 blur-2xl pointer-events-none" />
                <div className="relative">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
                    <i className={`${item.icon} text-xl`} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Big CTA banner */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-emerald-950 text-white flex flex-col md:flex-row items-center md:items-stretch">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(52,211,153,0.25),_transparent_55%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.4),_transparent_55%)] opacity-80" />
            <div className="relative w-full md:w-3/5 px-8 py-10 flex flex-col justify-center space-y-3">
              <span className="inline-flex items-center text-xs font-semibold tracking-[0.25em] uppercase text-emerald-200">
                Join the Adjetman squad
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                Lock in your next rotation before it sells out.
              </h3>
              <p className="text-sm sm:text-base text-emerald-100 max-w-md">
                Save your sizes, build wishlists and get early access to limited
                pairs, secret restocks and exclusive offers.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center rounded-full bg-white text-emerald-900 px-8 py-3 text-sm font-semibold shadow-lg hover:bg-emerald-100"
                >
                  Start shopping sneakers
                  <i className="ri-arrow-right-up-line ml-2" />
                </Link>
                <Link
                  href="/account"
                  className="inline-flex items-center rounded-full border border-emerald-200/70 px-6 py-3 text-sm font-semibold text-emerald-50 hover:bg-emerald-800/60"
                >
                  Create an account
                </Link>
              </div>
            </div>
            <div className="relative w-full md:w-2/5 py-6 pr-4 pl-4 md:pl-0">
              <div className="relative h-52 sm:h-64 md:h-full">
                <Image
                  src={bannerSneakerImg}
                  alt="Sneaker line-up"
                  fill
                  className="object-contain object-center drop-shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
