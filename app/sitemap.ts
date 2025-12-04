import { MetadataRoute } from 'next'
import { getServerApiUrl } from './lib/api'

interface Product {
  id: number
  updatedAt?: string
}

async function getProducts(): Promise<Product[]> {
  try {
    const apiUrl = getServerApiUrl()
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    })
    
    if (!res.ok) {
      return []
    }
    
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch products for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  const products = await getProducts()
  
  // 정적 페이지들
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
  
  // 동적 상품 페이지들
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  return [...staticPages, ...productPages]
}

