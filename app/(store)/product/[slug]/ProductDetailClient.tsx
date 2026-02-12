'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/query-cache';
import ProductCard from '@/components/ProductCard';
import ProductReviews from '@/components/ProductReviews';
import { StructuredData, generateProductSchema, generateBreadcrumbSchema } from '@/components/SEOHead';
import { notFound } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { usePageTitle } from '@/hooks/usePageTitle';

// Map common color names to hex values for the swatch preview
function colorNameToHex(name: string): string {
  const map: Record<string, string> = {
    red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308',
    orange: '#f97316', purple: '#a855f7', pink: '#ec4899', black: '#111827',
    white: '#ffffff', gray: '#6b7280', grey: '#6b7280', brown: '#92400e',
    navy: '#1e3a5f', gold: '#d4a017', silver: '#c0c0c0', beige: '#f5f5dc',
    maroon: '#800000', teal: '#14b8a6', coral: '#ff7f50', ivory: '#fffff0',
    cream: '#fffdd0', burgundy: '#800020', lavender: '#e6e6fa', cyan: '#06b6d4',
    magenta: '#d946ef', olive: '#84cc16', peach: '#ffcba4', mint: '#98f5e1',
    rose: '#f43f5e', wine: '#722f37', charcoal: '#374151', sky: '#0ea5e9',
  };
  return map[name.toLowerCase().trim()] || '#d1d5db';
}

export default function ProductDetailClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<any>(null);
  usePageTitle(product?.name || 'Product');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  const { addToCart } = useCart();

  useEffect(() => {
    if (!slug || typeof slug !== 'string') {
      setLoading(false);
      return;
    }
    async function fetchProduct() {
      try {
        setLoading(true);
        // Fetch main product (cached for 2 minutes)
        const result = await cachedQuery<{ data: any; error: any }>(
          `product:${slug}`,
          async () => {
            let query = supabase
              .from('products')
              .select(`
                *,
                categories(name),
                product_variants(*),
                product_images(url, position, alt_text)
              `);

            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

            if (isUUID) {
              query = query.or(`id.eq.${slug},slug.eq.${slug}`);
            } else {
              query = query.eq('slug', slug);
            }

            return query.single() as any;
          },
          2 * 60 * 1000 // 2 minutes
        );

        const productData = result && typeof result === 'object' && 'data' in result ? result.data : null;
        const error = result && typeof result === 'object' && 'error' in result ? result.error : null;

        if (error || !productData || typeof productData !== 'object') {
          setLoading(false);
          return;
        }

        // Transform product data
        // Map variant colors from option2, and extract color_hex from metadata
        const rawVariants = (productData.product_variants || []).map((v: any) => ({
          ...v,
          color: v.option2 || '',
          colorHex: v.metadata?.color_hex || ''
        }));

        // Build a color-to-hex map from variants (prefer stored hex, fallback to colorNameToHex)
        const colorHexMap: Record<string, string> = {};
        rawVariants.forEach((v: any) => {
          if (v.color) {
            if (!colorHexMap[v.color]) {
              colorHexMap[v.color] = v.colorHex || colorNameToHex(v.color);
            }
          }
        });

        const rawImages = Array.isArray(productData.product_images) ? productData.product_images : [];
        const sortedImages = rawImages
          .slice()
          .sort((a: any, b: any) => (Number(a?.position) ?? 0) - (Number(b?.position) ?? 0))
          .map((img: any) => (typeof img === 'string' ? img : img?.url))
          .filter((url: any): url is string => typeof url === 'string' && url.length > 0);
        const transformedProduct = {
          ...productData,
          images: sortedImages.length > 0 ? sortedImages : ['https://via.placeholder.com/800x800?text=No+Image'],
          category: productData.categories?.name || 'Shop',
          rating: productData.rating_avg ?? 0,
          reviewCount: 0,
          stockCount: productData.quantity ?? 0,
          moq: productData.moq ?? 1,
          colors: [...new Set(rawVariants.map((v: any) => v.color).filter(Boolean))],
          colorHexMap,
          variants: Array.isArray(rawVariants) ? rawVariants : [],
          sizes: rawVariants.map((v: any) => v.name).filter(Boolean) || [],
          features: ['Premium Quality', 'Authentic Design'],
          featured: ['Premium Quality', 'Authentic Design'],
          care: 'Handle with care.',
          preorderShipping: productData.metadata?.preorder_shipping || null
        };

        setProduct(transformedProduct);

        // Set initial quantity to MOQ
        if (transformedProduct.moq > 1) {
          setQuantity(transformedProduct.moq);
        }

        // If variants exist, do NOT pre-select — force user to choose
        // Reset variant and color selection
        setSelectedVariant(null);
        setSelectedSize('');
        setSelectedColor('');

        // Fetch related products (cached for 5 minutes)
        if (productData.category_id) {
          const { data: related } = await cachedQuery<{ data: any; error: any }>(
            `related:${productData.category_id}:${productData.id}`,
            (() => supabase
              .from('products')
              .select('*, product_images(url, position), product_variants(id, name, price, quantity)')
              .eq('category_id', productData.category_id)
              .neq('id', productData.id)
              .limit(4)) as any,
            5 * 60 * 1000
          );

          if (Array.isArray(related) && related.length > 0) {
            setRelatedProducts(related.map((p: any) => {
              const variants = p.product_variants || [];
              const hasVariants = variants.length > 0;
              const minVariantPrice = hasVariants ? Math.min(...variants.map((v: any) => v.price || p.price)) : undefined;
              const totalVariantStock = hasVariants ? variants.reduce((sum: number, v: any) => sum + (v.quantity || 0), 0) : 0;
              const effectiveStock = hasVariants ? totalVariantStock : p.quantity;
              return {
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                image: p.product_images?.[0]?.url || 'https://via.placeholder.com/800?text=No+Image',
                rating: p.rating_avg || 0,
                reviewCount: 0,
                inStock: effectiveStock > 0,
                maxStock: effectiveStock || 50,
                moq: p.moq || 1,
                hasVariants,
                minVariantPrice
              };
            }));
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const hasVariants = product?.variants?.length > 0;
  const hasColors = product?.colors?.length > 0;
  const needsVariantSelection = hasVariants && !selectedVariant;
  const needsColorSelection = hasColors && !selectedColor;

  // Determine the active price: variant price if selected, otherwise base price
  const activePrice = selectedVariant?.price ?? product?.price ?? 0;
  const activeStock = selectedVariant ? (selectedVariant.stock ?? selectedVariant.quantity ?? product?.stockCount ?? 0) : (product?.stockCount ?? 0);

  const handleAddToCart = () => {
    if (!product) return;
    if (needsVariantSelection) return; // Safety check

    // Build variant display string: "Color / Name" or just "Name" or just "Color"
    let variantLabel: string | undefined;
    if (selectedVariant) {
      const color = selectedVariant.color || selectedColor || '';
      const name = selectedVariant.name || '';
      if (color && name) {
        variantLabel = `${color} / ${name}`;
      } else {
        variantLabel = color || name || undefined;
      }
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: activePrice,
      image: product.images[0],
      quantity: quantity,
      variant: variantLabel,
      slug: product.slug,
      maxStock: activeStock,
      moq: product.moq || 1
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    window.location.href = '/checkout';
  };

  if (!slug || typeof slug !== 'string') {
    return (
      <div className="min-h-screen bg-white py-20 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
          <Link href="/shop" className="text-emerald-700 hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12 flex justify-center items-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-emerald-700 animate-spin mb-4 block"></i>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white py-20 flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link href="/shop" className="text-emerald-700 hover:underline">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const discount = product.compare_at_price && activePrice ? Math.round((1 - activePrice / product.compare_at_price) * 100) : 0;
  const variantPrices = (product.variants || []).map((v: any) => v.price ?? product.price).filter((p: number) => typeof p === 'number');
  const minVariantPrice = hasVariants && variantPrices.length > 0 ? Math.min(...variantPrices) : product.price;

  const baseUrlForSchema = typeof window !== 'undefined' ? `${window.location.origin}` : (process.env.NEXT_PUBLIC_APP_URL || 'https://www.adjetmansneakers.com');
  let productSchema: object | null = null;
  let breadcrumbSchema: object | null = null;
  try {
    productSchema = generateProductSchema({
      name: product.name || 'Product',
      description: product.description || product.name || '',
      image: Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
      price: hasVariants ? minVariantPrice : (Number(product.price) || 0),
      currency: 'GHS',
      sku: product.sku,
      rating: product.rating,
      reviewCount: product.reviewCount ?? 0,
      availability: (product.stockCount ?? product.quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
      category: product.category,
      url: `${baseUrlForSchema}/product/${slug}`
    });
    breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: baseUrlForSchema },
      { name: 'Shop', url: `${baseUrlForSchema}/shop` },
      { name: product.category || 'Shop', url: `${baseUrlForSchema}/shop?category=${String(product.category || '').toLowerCase().replace(/\s+/g, '-')}` },
      { name: product.name || 'Product', url: `${baseUrlForSchema}/product/${slug}` }
    ]);
  } catch (_) {
    productSchema = null;
    breadcrumbSchema = null;
  }

  return (
    <>
      {productSchema && <StructuredData data={productSchema} />}
      {breadcrumbSchema && <StructuredData data={breadcrumbSchema} />}

      <main className="min-h-screen bg-gray-100">
        <section className="py-4 sm:py-5 bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center flex-wrap gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500">
              <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              <i className="ri-arrow-right-s-line text-gray-300 text-sm" />
              <Link href="/shop" className="hover:text-emerald-600 transition-colors">Shop</Link>
              <i className="ri-arrow-right-s-line text-gray-300 text-sm" />
              <Link href={`/shop?category=${product.category?.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-emerald-600 transition-colors">{product.category}</Link>
              <i className="ri-arrow-right-s-line text-gray-300 text-sm" />
              <span className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-[240px]">{product.name}</span>
            </nav>
          </div>
        </section>

        <section className="py-6 sm:py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
              <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-gray-200/80">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 ring-2 ring-gray-100 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(product.images?.[selectedImage] ?? product.images?.[0]) || 'https://via.placeholder.com/800x800?text=No+Image'}
                    alt={product.name || 'Product'}
                    className="w-full h-full object-cover object-center"
                  />
                  {discount > 0 && (
                    <span className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-red-500 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full">
                      Save {discount}%
                    </span>
                  )}
                </div>

                {(product.images?.length ?? 0) > 1 && (
                  <div className="grid grid-cols-4 gap-2 sm:gap-4">
                    {product.images.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === index ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-emerald-50 hover:border-emerald-200'
                          }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image || 'https://via.placeholder.com/400x400?text=Image'}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover object-center"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 border-l-4 border-l-emerald-500">
                <span className="inline-block text-[11px] font-semibold tracking-[0.2em] text-emerald-600 uppercase mb-2">
                  {product.category}
                </span>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 leading-tight">
                    {product.name}
                  </h1>
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 transition-colors cursor-pointer"
                    aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <i className={`${isWishlisted ? 'ri-heart-fill text-red-500' : 'ri-heart-line text-gray-500'} text-xl`} />
                  </button>
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <i
                        key={star}
                        className={`${star <= Math.round(product.rating) ? 'ri-star-fill text-amber-400' : 'ri-star-line text-gray-300'} text-lg`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-600">{Number(product.rating).toFixed(1)}</span>
                </div>

                <div className="bg-emerald-50 rounded-2xl p-4 mb-6 border border-emerald-100">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    {hasVariants && !selectedVariant ? (
                      <span className="text-2xl sm:text-3xl font-bold text-emerald-800">
                        From GH₵{minVariantPrice.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold text-emerald-800">GH₵{activePrice.toFixed(2)}</span>
                    )}
                    {product.compare_at_price && product.compare_at_price > activePrice && (
                      <span className="text-lg text-gray-500 line-through">GH₵{product.compare_at_price.toFixed(2)}</span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>

                {/* Color Selector */}
                {hasVariants && (product.colors?.length ?? 0) > 0 && (
                  <div className="mb-6">
                    <label className="block font-semibold text-gray-900 mb-3">
                      Color: {selectedColor ? (
                        <span className="text-emerald-700 font-normal">{selectedColor}</span>
                      ) : (
                        <span className="text-red-500 font-normal text-sm">Please select a color</span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(product.colors || []).map((color: string) => {
                        const isSelected = selectedColor === color;
                        const colorVariants = (product.variants || []).filter((v: any) => v.color === color);
                        const colorStock = colorVariants.reduce((sum: number, v: any) => sum + (v.stock ?? v.quantity ?? 0), 0);
                        const isOutOfStock = colorStock === 0 && product.stockCount === 0;
                        return (
                          <button
                            key={color}
                            onClick={() => {
                              setSelectedColor(color);
                              // If only one variant for this color, auto-select it
                              const matching = (product.variants || []).filter((v: any) => v.color === color);
                              if (matching.length === 1) {
                                setSelectedVariant(matching[0]);
                                setSelectedSize(matching[0].name);
                              } else {
                                // Reset variant selection so user picks a size too
                                setSelectedVariant(null);
                                setSelectedSize('');
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`px-5 py-2.5 rounded-full border-2 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${isSelected
                              ? 'border-emerald-700 bg-emerald-50 text-emerald-700 shadow-sm'
                              : isOutOfStock
                                ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'border-gray-300 text-gray-700 hover:border-gray-400'
                              }`}
                          >
                            <span className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0 shadow-sm" style={{ backgroundColor: product.colorHexMap?.[color] || colorNameToHex(color) }}></span>
                            <span>{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Size / Name Variant Selector */}
                {hasVariants && (() => {
                  // Filter variants: if colors exist and one is selected, show only matching; otherwise show all
                  const hasColors = (product.colors?.length ?? 0) > 0;
                  const variantsList = product.variants || [];
                  const visibleVariants = hasColors && selectedColor
                    ? variantsList.filter((v: any) => v.color === selectedColor)
                    : hasColors
                      ? [] // Don't show name variants until a color is picked
                      : variantsList;

                  // Check if we need to show the name selector (skip if all visible variants have the same name or only 1)
                  const uniqueNames = [...new Set(visibleVariants.map((v: any) => v.name).filter(Boolean))];
                  const showNameSelector = visibleVariants.length > 1 || (!hasColors && visibleVariants.length > 0);

                  if (!showNameSelector && !hasColors) {
                    // Single variant with no colors — show standard picker
                    return (
                      <div className="mb-8">
                        <label className="block font-semibold text-gray-900 mb-3">
                          Variant: {selectedVariant ? (
                            <span className="text-emerald-700 font-normal">{selectedVariant.name} — GH₵{selectedVariant.price?.toFixed(2)}</span>
                          ) : (
                            <span className="text-red-500 font-normal text-sm">Please select a variant</span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {(product.variants || []).map((variant: any) => {
                            const isSelected = selectedVariant?.id === variant.id || selectedVariant?.name === variant.name;
                            const variantStock = variant.stock ?? variant.quantity ?? 0;
                            const isOutOfStock = variantStock === 0 && product.stockCount === 0;
                            return (
                              <button
                                key={variant.id || variant.name}
                                onClick={() => {
                                  setSelectedVariant(variant);
                                  setSelectedSize(variant.name);
                                }}
                                disabled={isOutOfStock}
                                className={`px-6 py-3 rounded-lg border-2 font-medium transition-all whitespace-nowrap cursor-pointer flex flex-col items-center ${isSelected
                                  ? 'border-emerald-700 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : isOutOfStock
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                  }`}
                              >
                                <span>{variant.name}</span>
                                <span className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                                  GH₵{(variant.price ?? product.price ?? 0).toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  if (visibleVariants.length > 1) {
                    return (
                      <div className="mb-8">
                        <label className="block font-semibold text-gray-900 mb-3">
                          Size / Type: {selectedVariant ? (
                            <span className="text-emerald-700 font-normal">{selectedVariant.name} — GH₵{selectedVariant.price?.toFixed(2)}</span>
                          ) : (
                            <span className="text-red-500 font-normal text-sm">Please select</span>
                          )}
                        </label>
                        <div className="flex flex-wrap gap-3">
                          {visibleVariants.map((variant: any) => {
                            const isSelected = selectedVariant?.id === variant.id;
                            const variantStock = variant.stock ?? variant.quantity ?? 0;
                            const isOutOfStock = variantStock === 0 && product.stockCount === 0;
                            return (
                              <button
                                key={variant.id || variant.name}
                                onClick={() => {
                                  setSelectedVariant(variant);
                                  setSelectedSize(variant.name);
                                }}
                                disabled={isOutOfStock}
                                className={`px-6 py-3 rounded-lg border-2 font-medium transition-all whitespace-nowrap cursor-pointer flex flex-col items-center ${isSelected
                                  ? 'border-emerald-700 bg-emerald-50 text-emerald-700 shadow-sm'
                                  : isOutOfStock
                                    ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                                  }`}
                              >
                                <span>{variant.name}</span>
                                <span className={`text-xs mt-0.5 ${isSelected ? 'text-emerald-600' : 'text-gray-500'}`}>
                                  GH₵{(variant.price ?? product.price ?? 0).toFixed(2)}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}

                <div className="mb-8">
                  <label className="block font-semibold text-gray-900 mb-3">Quantity</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border-2 border-gray-300 rounded-lg">
                      <button
                        onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                        className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        disabled={activeStock === 0 || quantity <= (product.moq || 1)}
                      >
                        <i className="ri-subtract-line text-xl"></i>
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(product.moq || 1, Math.min(activeStock, parseInt(e.target.value) || (product.moq || 1))))}
                        className="w-16 h-12 text-center border-x-2 border-gray-300 focus:outline-none text-lg font-semibold"
                        min={product.moq || 1}
                        max={activeStock}
                        disabled={activeStock === 0}
                      />
                      <button
                        onClick={() => setQuantity(Math.min(activeStock, quantity + 1))}
                        className="w-12 h-12 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                        disabled={activeStock === 0}
                      >
                        <i className="ri-add-line text-xl"></i>
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {product.moq > 1 && (
                        <span className="text-emerald-700 font-medium text-sm">
                          <i className="ri-information-line mr-1"></i>
                          Min. order: {product.moq} units
                        </span>
                      )}
                      {activeStock > 10 && (
                        <span className="text-gray-600 font-medium text-sm">
                          <i className="ri-checkbox-circle-line mr-1 text-emerald-600"></i>
                          {activeStock} in stock
                        </span>
                      )}
                      {activeStock > 0 && activeStock <= 10 && (
                        <span className="text-amber-600 font-medium text-sm">
                          <i className="ri-error-warning-line mr-1"></i>
                          Only {activeStock} left in stock
                        </span>
                      )}
                      {activeStock === 0 && (
                        <span className="text-red-600 font-medium">
                          <i className="ri-close-circle-line mr-1"></i>
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <button
                    disabled={activeStock === 0 || needsVariantSelection || needsColorSelection}
                    className={`flex-1 rounded-xl py-3.5 font-semibold text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      activeStock === 0 || needsVariantSelection || needsColorSelection
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                    onClick={handleAddToCart}
                  >
                    <i className="ri-shopping-cart-line text-lg" />
                    <span>
                      {activeStock === 0
                        ? 'Out of stock'
                        : needsColorSelection
                          ? 'Select a color'
                          : needsVariantSelection
                            ? 'Select options'
                            : 'Add to cart'}
                    </span>
                  </button>
                  {activeStock > 0 && !needsVariantSelection && !needsColorSelection && (
                    <button
                      onClick={handleBuyNow}
                      className="rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-6 py-3.5 font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Buy now
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-3">
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <i className="ri-store-2-line text-emerald-600 text-lg" />
                    <span>Free store pickup available</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <i className="ri-arrow-left-right-line text-emerald-600 text-lg" />
                    <span>30-day easy returns</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-700">
                    <i className="ri-shield-check-line text-emerald-600 text-lg" />
                    <span>Secure payment</span>
                  </div>
                  {product.sku && (
                    <div className="flex items-center gap-3 text-sm text-gray-700">
                      <i className="ri-barcode-line text-emerald-600 text-lg" />
                      <span>SKU: {product.sku}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-gray-100 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-b border-emerald-100 mb-6">
              <div className="flex flex-wrap gap-4 sm:gap-6">
                {['description', 'features', 'care', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 font-medium text-sm transition-colors whitespace-nowrap cursor-pointer border-b-2 -mb-px ${
                      activeTab === tab
                        ? 'text-emerald-700 border-emerald-600'
                        : 'text-gray-500 hover:text-gray-700 border-transparent'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeTab === 'description' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{product.description || product.name || 'No description available.'}</p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Key features</h3>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {(product.features || []).map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm sm:text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Care instructions</h3>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{product.care || 'Handle with care.'}</p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div id="reviews" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <ProductReviews productId={product.id || ''} />
              </div>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="py-10 sm:py-14 bg-white" data-product-shop>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <p className="text-xs font-semibold tracking-[0.25em] text-emerald-600 uppercase mb-2 text-center">
                You may also like
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2 text-center">
                More from this collection
              </h2>
              <p className="text-sm text-gray-600 mb-8 text-center max-w-md mx-auto">
                Curated picks based on this product
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
