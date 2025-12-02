import type { Metadata } from "next";
import Link from "next/link";
import ProductDetailLoader from "./ProductDetailLoader";
import { Product } from "../../types";
import { getServerApiUrl, getFetchOptions } from "../../lib/api";
import { getProductSchema, getBreadcrumbSchema } from "../../lib/seo";

async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = getServerApiUrl();
  const fullUrl = `${apiUrl}/products/${id}`;

  try {
    const res = await fetch(fullUrl, {
      cache: 'no-store',
      ...getFetchOptions(),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    return null;
  }
}

// 정적 경로 생성 (주요 상품 페이지 사전 생성)
export async function generateStaticParams() {
  const apiUrl = getServerApiUrl();

  try {
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
      cache: 'no-store', // 개발 중에는 캐시 비활성화
      ...getFetchOptions(),
    });

    if (!res.ok) {
      return [];
    }

    const products: Product[] = await res.json();
    return products.slice(0, 10).map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    return [];
  }
}

// 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const product = await getProduct(resolvedParams.id);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lian-shop.com';

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다 - 리안샵',
      description: '요청하신 상품을 찾을 수 없습니다.',
    };
  }

  const productTitle = `${product.name} - 리안샵`;
  const productDescription = product.description || `리안샵에서 ${product.name}을(를) 만나보세요. 프리미엄 품질의 제품을 최고의 가격으로 제공합니다.`;
  const productImage = product.imageUrl || `${baseUrl}/og-image.png`;

  return {
    title: productTitle,
    description: productDescription,
    keywords: ['리안', '리안샵', product.name, '온라인쇼핑', '프리미엄'],
    openGraph: {
      title: productTitle,
      description: productDescription,
      url: `/product/${product.id}`,
      siteName: 'Lian Shop',
      images: [
        {
          url: productImage,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: productTitle,
      description: productDescription,
      images: [productImage],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Next.js 15에서는 params가 Promise일 수 있음
  const resolvedParams = await Promise.resolve(params);
  const productId = resolvedParams.id;

  if (!productId) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
            잘못된 상품 ID입니다
          </h1>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 서버에서 먼저 시도하고, 실패하면 클라이언트에서 재시도
  const product = await getProduct(productId);

  // JSON-LD 구조화된 데이터
  const productSchema = product ? getProductSchema({
    id: product.id,
    name: product.name,
    description: product.description || '',
    price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    image: product.imageUrl || '',
    brand: 'Lian Shop',
  }) : null;

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: '홈', url: '/' },
    { name: '상품', url: '/products' },
    { name: product?.name || '상품 상세', url: `/product/${productId}` },
  ]);

  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <ProductDetailLoader productId={productId} initialProduct={product} />
    </>
  );
}

