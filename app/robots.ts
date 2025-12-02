import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/checkout/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
      {
        userAgent: 'Yeti', // 네이버 검색봇
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

