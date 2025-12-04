/**
 * SEO 스키마 유틸리티 함수
 */

interface ProductSchemaItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  brand: string;
}

/**
 * 조직(Organization) 스키마 생성
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '리안샵 (Lian Shop)',
    description: '미니멀 라이프스타일 쇼핑몰',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/logo.png`,
    sameAs: [
      // 소셜 미디어 링크를 여기에 추가할 수 있습니다
    ],
  };
}

/**
 * 웹사이트(Website) 스키마 생성
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '리안샵',
    description: '미니멀 라이프스타일 쇼핑몰',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/products?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * 상품 목록(ItemList) 스키마 생성
 */
export function getItemListSchema(products: ProductSchemaItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.id}`,
        name: product.name,
        description: product.description,
        image: product.image,
        brand: {
          '@type': 'Brand',
          name: product.brand,
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'KRW',
          availability: 'https://schema.org/InStock',
        },
      },
    })),
  };
}

/**
 * 개별 상품(Product) 스키마 생성
 */
export function getProductSchema(product: ProductSchemaItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.id}`,
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/product/${product.id}`,
    },
  };
}

/**
 * 빵 부스러기(BreadcrumbList) 스키마 생성
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

