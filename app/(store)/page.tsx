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
          .limit(9);

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
  // Use custom hero sneaker image by default (can be overridden from CMS)
  const heroImage =
    getSetting('hero_image') || '/cc865524879023ad80ead9ec87c8e0eec2b66dc8.png';
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

  const popularProducts = featuredProducts.slice(0, 3);
  const latestProducts = featuredProducts;

  return (
    <main className="flex-col items-center justify-between min-h-screen bg-white">
      {renderBanners()}

      {/* Hero Section – matches KicksPlug hero */}
      <section className="relative w-full bg-hero-grid text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-10">
          {/* Left: Text */}
          <div className="w-full lg:w-1/2 space-y-6">
            <span className="inline-flex items-center rounded-full bg-white/10 border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
              KicksPlug
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.2rem] font-extrabold leading-tight">
              {heroHeadline}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl">
              {heroSubheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href={heroPrimaryLink}
                className="btn-animate inline-flex items-center justify-center rounded-full bg-[#FFC727] px-10 py-4 text-sm sm:text-base font-semibold text-gray-900 shadow-lg hover:bg-[#ffb800]"
              >
                {heroPrimaryText}
              </Link>
              <Link
                href={heroSecondaryLink}
                className="btn-animate inline-flex items-center justify-center rounded-full border border-white px-10 py-4 text-sm sm:text-base font-semibold text-white hover:bg-white hover:text-gray-900"
              >
                {heroSecondaryText}
              </Link>
            </div>
          </div>

          {/* Right: Sneaker image */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="relative max-w-lg w-full">
              <div className="absolute inset-0 rounded-[2.5rem] bg-black/10 blur-3xl" />
              <div className="relative rounded-[2.5rem] bg-[#064E3B] px-6 py-6 shadow-2xl overflow-hidden">
                <div className="relative aspect-[16/9]">
                  <Image
                    src={heroImage}
                    alt="Featured sneaker"
                    fill
                    className="object-contain object-center drop-shadow-2xl"
                    sizes="(min-width: 1024px) 480px, 100vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Popular Products */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
                Our Popular Products
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center text-sm font-medium text-gray-900 hover:text-emerald-700"
            >
              Explore More
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
                  <div
                    key={product.id}
                    className="rounded-3xl bg-white shadow-sm hover-lift p-4 flex flex-col"
                  >
                    <div className="relative mb-4 rounded-3xl bg-gray-100 overflow-hidden aspect-[4/5]">
                      <Image
                        src={
                          product.product_images?.[0]?.url ||
                          'https://via.placeholder.com/400x500'
                        }
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 320px, 50vw"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-xs text-gray-400 mb-1">
                        01 COLOR
                      </span>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-gray-900">
                          GH₵{(minVariantPrice ?? product.price).toFixed(2)}
                        </span>
                        <span className="flex items-center text-xs text-gray-500">
                          <span className="text-yellow-400 mr-1">
                            <i className="ri-star-fill" />
                          </span>
                          4.5
                          <span className="ml-1">(125)</span>
                        </span>
                      </div>
                      <div className="mt-4">
                        <Link
                          href={`/product/${product.slug}`}
                          className="inline-flex items-center justify-center rounded-full border border-gray-200 px-4 py-2 text-xs font-medium text-gray-900 hover:bg-gray-900 hover:text-white"
                        >
                          Add to Cart
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </AnimatedGrid>
          )}
        </div>
      </section>

      {/* Best Shoes Collection */}
      <section className="bg-white pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              Best Shoes Collection
            </h2>
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center text-sm font-medium text-gray-900 hover:text-emerald-700"
            >
              Explore More
              <i className="ri-arrow-right-line ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr,3fr] gap-6">
            <div className="rounded-3xl overflow-hidden relative bg-gray-900">
              <Image
                src="/ad9048e4060aae008ec4a17cfe2d9bdb52f58f97.png"
                alt="Basketball collection"
                fill
                className="object-cover object-center"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {latestProducts.slice(0, 3).map((product) => (
                <div
                  key={product.id}
                  className="rounded-3xl overflow-hidden bg-gray-100 relative aspect-[4/3]"
                >
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
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Latest Products */}
      <section className="bg-white pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
              Our Latest Products
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-[3/4] rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <AnimatedGrid className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => {
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
                    badge={product.featured ? 'Featured' : undefined}
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
      </section>

      {/* Promo Banner – Elegance craft Ascent Shoes */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-hero-grid text-white flex flex-col md:flex-row items-center md:items-stretch">
            <div className="w-full md:w-2/3 px-8 py-10 flex flex-col justify-center space-y-3">
              <span className="text-sm uppercase tracking-[0.25em] text-white/80">
                New Arrival
              </span>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold">
                Elegance craft Ascent Shoes
              </h3>
              <p className="text-sm sm:text-base text-white/90 max-w-md">
                Experience unmatched comfort and performance with our latest
                running silhouette.
              </p>
              <Link
                href="/shop"
                className="mt-4 inline-flex w-max items-center rounded-full bg-[#FF7A1A] px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#ff6a00]"
              >
                Explore More
              </Link>
            </div>
            <div className="w-full md:w-1/3 relative py-6 pr-6">
              <div className="relative h-40 sm:h-48 md:h-full">
                <Image
                  src="/ad9048e4060aae008ec4a17cfe2d9bdb52f58f97.png"
                  alt="Ascent Shoes"
                  fill
                  className="object-contain object-center drop-shadow-2xl"
                />
              </div>
              <div className="absolute top-6 right-6 rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-semibold shadow-lg">
                GH₵99.99
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
