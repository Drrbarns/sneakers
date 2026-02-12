'use client';

import { useState } from 'react';
import Link from 'next/link';
import LazyImage from './LazyImage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

// Map common color names to hex values for swatches
const COLOR_MAP: Record<string, string> = {
  black: '#000000', white: '#FFFFFF', red: '#EF4444', blue: '#3B82F6',
  navy: '#1E3A5F', green: '#22C55E', yellow: '#EAB308', orange: '#F97316',
  pink: '#EC4899', purple: '#A855F7', brown: '#92400E', beige: '#D4C5A9',
  grey: '#6B7280', gray: '#6B7280', cream: '#FFFDD0', teal: '#14B8A6',
  maroon: '#800000', coral: '#FF7F50', burgundy: '#800020', olive: '#808000',
  tan: '#D2B48C', khaki: '#C3B091', charcoal: '#36454F', ivory: '#FFFFF0',
  gold: '#FFD700', silver: '#C0C0C0', rose: '#FF007F', lavender: '#E6E6FA',
  mint: '#98FB98', peach: '#FFDAB9', wine: '#722F37', denim: '#1560BD',
  nude: '#E3BC9A', camel: '#C19A6B', sage: '#BCB88A', rust: '#B7410E',
  mustard: '#FFDB58', plum: '#8E4585', lilac: '#C8A2C8', stone: '#928E85',
  sand: '#C2B280', taupe: '#483C32', mauve: '#E0B0FF', sky: '#87CEEB',
  forest: '#228B22', cobalt: '#0047AB', emerald: '#50C878', scarlet: '#FF2400',
  aqua: '#00FFFF', turquoise: '#40E0D0', indigo: '#4B0082', crimson: '#DC143C',
  magenta: '#FF00FF', cyan: '#00FFFF', chocolate: '#7B3F00', coffee: '#6F4E37',
};

export function getColorHex(colorName: string): string | null {
  const lower = colorName.toLowerCase().trim();
  if (COLOR_MAP[lower]) return COLOR_MAP[lower];
  // Try partial match (e.g. "Light Blue" -> "blue")
  for (const [key, val] of Object.entries(COLOR_MAP)) {
    if (lower.includes(key)) return val;
  }
  return null;
}

export interface ColorVariant {
  name: string;
  hex: string;
}

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  inStock?: boolean;
  maxStock?: number;
  moq?: number;
  hasVariants?: boolean;
  minVariantPrice?: number;
  colorVariants?: ColorVariant[];
}

export default function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 5,
  reviewCount = 0,
  badge,
  inStock = true,
  maxStock = 50,
  moq = 1,
  hasVariants = false,
  minVariantPrice,
  colorVariants = []
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);
  const displayPrice = hasVariants && minVariantPrice ? minVariantPrice : price;
  const discount = originalPrice ? Math.round((1 - displayPrice / originalPrice) * 100) : 0;
  const colorCount = colorVariants.length || (hasVariants ? 1 : 0);
  const colorLabel = colorCount <= 1 ? '01 COLOR' : `${String(colorCount).padStart(2, '0')} COLORS`;

  const formatPrice = (val: number) => `GH\u20B5${val.toFixed(2)}`;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) removeFromWishlist(id);
    else addToWishlist({ id, name, price, originalPrice, image, rating, reviewCount, badge, inStock: inStock ?? true, slug });
  };

  return (
    <div className="group bg-gray-100 rounded-2xl overflow-hidden h-full flex flex-col">
      {/* Top: name, color, wishlist */}
      <div className="px-4 pt-4 pb-1 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link href={`/product/${slug}`} className="block">
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 group-hover:text-gray-700">
              {name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-0.5 uppercase tracking-wide">
            {colorLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
        >
          <i className={inWishlist ? 'ri-heart-fill text-red-500' : 'ri-heart-line'} />
        </button>
      </div>

      {/* Image */}
      <Link href={`/product/${slug}`} className="relative block aspect-[3/4] overflow-hidden bg-white mx-4 rounded-xl">
        <LazyImage
          src={image}
          alt={name}
          className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
        />
        {badge && (
          <span className="absolute top-2 left-2 bg-white/95 text-gray-900 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md border border-gray-100">
            {badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] uppercase font-semibold px-2.5 py-1 rounded-md">
            -{discount}%
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Bottom: price, rating, add to cart */}
      <div className="px-4 pb-4 pt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-gray-900 text-base">
            {hasVariants && minVariantPrice ? `From ${formatPrice(minVariantPrice)}` : formatPrice(price)}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-0.5">
            <i className="ri-star-fill text-amber-400 text-sm" />
            <span>{rating.toFixed(1)}</span>
            <span>({reviewCount})</span>
          </span>
        </div>
        {hasVariants ? (
          <Link
            href={`/product/${slug}`}
            className="rounded-xl border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Select Options
          </Link>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addToCart({ id, name, price, image, quantity: moq, slug, maxStock, moq });
            }}
            disabled={!inStock}
            className="rounded-xl border border-gray-300 bg-gray-50 text-gray-900 px-4 py-2 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
