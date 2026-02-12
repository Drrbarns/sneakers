import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://adjetmansneakers.vercel.app').replace(/\/$/, '');

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/account/', '/checkout', '/pay/', '/order-success', '/order-tracking', '/auth/'].join('\n'),
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
