import { Metadata } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.adjetmansneakers.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Adjetman Sneakers';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'product' | 'article';
  canonicalPath?: string;
  price?: number;
  currency?: string;
  availability?: string;
  category?: string;
  publishedTime?: string;
  author?: string;
  noindex?: boolean;
}

export function generateMetadata({
  title = 'Adjetman Sneakers – Authentic Sneakers & Streetwear',
  description = 'Shop authentic sneakers, slides, Crocs, Birkenstock, bags, watches and streetwear in Ghana. Fast delivery, free store pickup, 30-day returns. Adjetman Sneakers – your plug for drip.',
  keywords = [],
  ogImage,
  ogType = 'website',
  canonicalPath = '',
  price,
  currency = 'GHS',
  availability,
  category,
  publishedTime,
  author,
  noindex = false
}: SEOProps): Metadata {
  const siteName = SITE_NAME;
  const siteUrl = SITE_URL;
  const fullTitle = title && (title.includes(siteName) || title.length > 50) ? title : title ? `${title} | ${siteName}` : siteName;
  const defaultOgImage = `${siteUrl}/og-image.jpg`;
  const imageUrl = ogImage?.startsWith('http') ? ogImage : ogImage ? `${siteUrl}${ogImage.startsWith('/') ? '' : '/'}${ogImage}` : defaultOgImage;
  const canonical = canonicalPath ? `${siteUrl.replace(/\/$/, '')}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}` : siteUrl;

  const defaultKeywords = [
    'sneakers Ghana',
    'authentic sneakers',
    'buy sneakers online Ghana',
    'streetwear Ghana',
    'Adjetman Sneakers',
    'free delivery Accra',
    'store pickup Ghana',
    'Crocs Ghana',
    'Birkenstock Ghana'
  ];

  const allKeywords = [...new Set([...keywords, ...defaultKeywords])];

  const metadata: Metadata = {
    title: fullTitle,
    description: description.slice(0, 160),
    keywords: allKeywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    openGraph: {
      title: fullTitle,
      description: description.slice(0, 160),
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title || siteName }],
      type: ogType as any,
      siteName,
      locale: 'en_GH',
      url: canonical
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: description.slice(0, 160),
      images: [imageUrl]
    },
    robots: noindex ? {
      index: false,
      follow: false
    } : {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    alternates: {
      canonical
    }
  };

  if (ogType === 'article' && publishedTime) {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime
    };
  }

  if (ogType === 'product' && price !== undefined) {
    (metadata.openGraph as any).type = 'product';
    (metadata.openGraph as any).images = metadata.openGraph?.images;
  }

  return metadata;
}

const SITE_URL_SCHEMA = process.env.NEXT_PUBLIC_APP_URL || 'https://www.adjetmansneakers.com';

export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string | string[];
  price: number;
  currency?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
  availability?: string;
  brand?: string;
  category?: string;
  url?: string;
}) {
  const rawImage = Array.isArray(product.image) ? product.image[0] : product.image;
  const imageUrl = typeof rawImage === 'string' && rawImage
    ? (rawImage.startsWith('http') ? rawImage : `${SITE_URL_SCHEMA}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`)
    : undefined;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product' as const,
    name: product.name || 'Product',
    description: (product.description || product.name || '').slice(0, 500),
    image: imageUrl,
    sku: product.sku || undefined,
    brand: {
      '@type': 'Brand' as const,
      name: product.brand || 'Adjetman Sneakers'
    },
    offers: {
      '@type': 'Offer' as const,
      price: product.price,
      priceCurrency: product.currency || 'GHS',
      availability: product.availability === 'in_stock' || product.availability === 'InStock'
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: product.url || SITE_URL_SCHEMA,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  };

  if (product.rating != null && (product.reviewCount ?? 0) > 0) {
    (schema as any).aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount ?? 0,
      bestRating: 5,
      worstRating: 1
    };
  }

  if (product.category) {
    (schema as any).category = product.category;
  }

  return schema;
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

export function generateOrganizationSchema(logoUrl?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.adjetmansneakers.com';
  const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Adjetman Sneakers';
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization' as const,
    name,
    url: siteUrl,
    logo: logoUrl?.startsWith('http') ? logoUrl : logoUrl ? `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}` : `${siteUrl}/black.png`,
    contactPoint: {
      '@type': 'ContactPoint' as const,
      telephone: '+233-53-471-2925',
      contactType: 'customer service',
      areaServed: 'GH',
      availableLanguage: 'English'
    },
    sameAs: [] as string[]
  };
}

export function generateWebsiteSchema() {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.adjetmansneakers.com';
  const name = process.env.NEXT_PUBLIC_SITE_NAME || 'Adjetman Sneakers';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite' as const,
    name,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction' as const,
      target: {
        '@type': 'EntryPoint' as const,
        urlTemplate: `${siteUrl.replace(/\/$/, '')}/shop?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function StructuredData({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}