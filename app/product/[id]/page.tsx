import type { Metadata } from "next";
import Link from "next/link";
import ProductDetailLoader from "./ProductDetailLoader";
import { Product } from "../../types";
import { getServerApiUrl, getFetchOptions } from "../../lib/api";

async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = getServerApiUrl();
  const fullUrl = `${apiUrl}/products/${id}`;

  try {
    const res = await fetch(fullUrl, {
      cache: 'no-store',
      ...getFetchOptions(),
    });

    if (!res.ok) {
      console.error(`[Server] Failed to fetch product: ${res.status} ${res.statusText}`);
      console.error(`[Server] URL: ${fullUrl}`);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("[Server] Error fetching product:", error);
    console.error(`[Server] URL: ${fullUrl}`);
    console.error(`[Server] Product ID: ${id}`);
    if (error instanceof Error) {
      console.error(`[Server] Error message: ${error.message}`);
    }
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
      console.error(`Failed to fetch products list: ${res.status}`);
      return [];
    }

    const products: Product[] = await res.json();
    return products.slice(0, 10).map((product) => ({
      id: product.id.toString(),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
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

  if (!product) {
    return {
      title: '상품을 찾을 수 없습니다 - Lian Shop',
    };
  }

  return {
    title: `${product.name} - Lian Shop`,
    description: product.description || `${product.name} 상품 상세 페이지`,
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

  return <ProductDetailLoader productId={productId} initialProduct={product} />;
}

