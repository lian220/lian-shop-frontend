import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | string; // BigDecimal은 JSON에서 문자열로 변환될 수 있음
  stockQuantity: number;
  imageUrl: string | null;
}

function parsePrice(price: number | string): number {
  if (typeof price === 'string') {
    return parseFloat(price);
  }
  return price;
}

async function getProduct(id: string): Promise<Product | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  try {
    const res = await fetch(`${apiUrl}/products/${id}`, {
      next: { revalidate: 300 }, // ISR: 5분마다 재검증
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`Failed to fetch product: ${res.status} ${res.statusText}`);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    if (process.env.NODE_ENV === 'development') {
      console.error("API URL:", apiUrl);
      console.error("Product ID:", id);
    }
    return null;
  }
}

// 정적 경로 생성 (주요 상품 페이지 사전 생성)
export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

  try {
    const res = await fetch(`${apiUrl}/products`, {
      next: { revalidate: 3600 }, // 1시간마다 재검증
    });

    if (!res.ok) return [];

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
  params: { id: string };
}): Promise<Metadata> {
  const product = await getProduct(params.id);

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
  params: { id: string };
}) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-black dark:text-zinc-50">
            상품을 찾을 수 없습니다
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

  return (
    <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors group"
        >
          <svg
            className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          상품 목록으로 돌아가기
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl overflow-hidden max-w-6xl mx-auto">
          <div className="md:flex">
            {/* 상품 이미지 */}
            <div className="md:w-1/2 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
              <div className="aspect-square flex items-center justify-center p-8">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-contain rounded-lg"
                    priority={true}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-32 h-32 text-zinc-300 dark:text-zinc-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* 상품 정보 */}
            <div className="md:w-1/2 p-8 md:p-12">
              {/* 재고 상태 배지 */}
              <div className="mb-4">
                {product.stockQuantity === 0 ? (
                  <span className="inline-block bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-semibold">
                    품절
                  </span>
                ) : product.stockQuantity < 10 ? (
                  <span className="inline-block bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-semibold">
                    재고 부족
                  </span>
                ) : (
                  <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-semibold">
                    재고 있음
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">
                {product.name}
              </h1>

              <div className="mb-6">
                <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  ₩{parsePrice(product.price).toLocaleString()}
                </span>
              </div>

              <div className="mb-8 space-y-4">
                <div>
                  <h2 className="font-semibold text-lg mb-3 text-zinc-900 dark:text-zinc-50">
                    상품 설명
                  </h2>
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {product.description || "설명 없음"}
                  </p>
                </div>

                <div className="flex items-center space-x-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">재고 수량</span>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                      {product.stockQuantity}개
                    </p>
                  </div>
                </div>
              </div>

              {/* 수량 선택 및 버튼 */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    수량:
                  </label>
                  <div className="flex items-center border border-zinc-300 dark:border-zinc-700 rounded-lg">
                    <button className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={product.stockQuantity}
                      defaultValue="1"
                      className="w-16 text-center border-x border-zinc-300 dark:border-zinc-700 py-2 bg-transparent text-zinc-900 dark:text-zinc-50"
                    />
                    <button className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg font-semibold transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    disabled={product.stockQuantity === 0}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <span>{product.stockQuantity > 0 ? "장바구니에 추가" : "품절"}</span>
                  </button>
                  <button
                    className="flex-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-4 rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:bg-zinc-400 disabled:cursor-not-allowed"
                    disabled={product.stockQuantity === 0}
                  >
                    바로 구매
                  </button>
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">배송 정보</span>
                    <p className="text-zinc-900 dark:text-zinc-50 font-medium mt-1">
                      무료 배송 (5만원 이상)
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-500 dark:text-zinc-400">반품/교환</span>
                    <p className="text-zinc-900 dark:text-zinc-50 font-medium mt-1">
                      7일 이내 가능
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

