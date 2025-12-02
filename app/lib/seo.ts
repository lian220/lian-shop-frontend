// JSON-LD 구조화된 데이터 생성 헬퍼 함수들

export interface ProductSchemaProps {
  id: number
  name: string
  description: string
  price: number
  image: string
  category?: string
  brand?: string
}

// Organization Schema
export function getOrganizationSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lian Shop',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: '미니멀하고 모던한 라이프스타일 제품을 제공하는 프리미엄 온라인 쇼핑몰',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@lian-shop.com',
    },
    sameAs: [
      // SNS 링크들 (실제 링크로 교체하세요)
      'https://www.instagram.com/lianshop',
      'https://twitter.com/lianshop',
      'https://www.facebook.com/lianshop',
    ],
  }
}

// Website Schema
export function getWebsiteSchema() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lian Shop',
    url: baseUrl,
    description: '미니멀하고 모던한 라이프스타일 제품을 만나보세요',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

// Product Schema
export function getProductSchema(product: ProductSchemaProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: `LIAN-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Lian Shop',
    },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.id}`,
      priceCurrency: 'KRW',
      price: product.price,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Lian Shop',
      },
    },
  }
}

// Breadcrumb Schema
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  }
}

// ItemList Schema (상품 목록)
export function getItemListSchema(products: ProductSchemaProps[]) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        url: `${baseUrl}/product/${product.id}`,
        image: product.image,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'KRW',
        },
      },
    })),
  }
}

