import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { generateMetadata as generateSEOMetadata } from '@/components/SEOHead';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adjetmansneakers.vercel.app';

async function getProductBySlug(slug: string) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    const supabase = createClient(url, key);
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    let query = supabase
      .from('products')
      .select('id, name, slug, description, price, compare_at_price, quantity, seo_title, seo_description, product_images(url, position)')
      .eq('status', 'active');
    if (isUUID) query = query.or(`id.eq.${slug},slug.eq.${slug}`);
    else query = query.eq('slug', slug);
    const { data, error } = await query.single();
    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) {
      return { title: 'Product Not Found' };
    }
    const title = product.seo_title || product.name || 'Product';
    const description = (product.seo_description || product.description || product.name || '').slice(0, 160);
    const images = (product.product_images || []).sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0)).map((i: any) => i?.url).filter(Boolean);
    const firstImage = images[0];
    const ogImage = typeof firstImage === 'string' && firstImage.startsWith('http') ? firstImage : firstImage ? `${siteUrl}${String(firstImage).startsWith('/') ? '' : '/'}${firstImage}` : `${siteUrl}/og-image.jpg`;
    return generateSEOMetadata({
      title,
      description: description || 'Shop authentic sneakers and streetwear in Ghana.',
      canonicalPath: `/product/${slug}`,
      ogImage,
      ogType: 'product',
      keywords: [product.name, 'sneakers Ghana', 'buy online', product.slug].filter(Boolean),
      price: Number(product.price) || 0,
      currency: 'GHS',
      availability: (product.quantity ?? 0) > 0 ? 'in_stock' : 'out_of_stock',
    });
  } catch {
    return { title: 'Product' };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
