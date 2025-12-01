import Link from "next/link";

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

async function getProducts(): Promise<Product[]> {
  // 서버 사이드에서는 직접 백엔드 URL 사용
  // 클라이언트 사이드에서는 rewrites를 통해 프록시 사용 가능
  // .env.local에 이미 /api가 포함되어 있을 수 있으므로 확인
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  // baseUrl에 /api가 이미 포함되어 있으면 그대로 사용, 아니면 추가
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  const apiEndpoint = `${apiUrl}/products`;
  
  try {
    // 서버 사이드에서 fetch 사용 시 절대 URL 필요
    const res = await fetch(apiEndpoint, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      console.error(`[Server] Failed to fetch products: ${res.status} ${res.statusText}`);
      console.error(`[Server] Response: ${errorText}`);
      console.error(`[Server] API Endpoint: ${apiEndpoint}`);
      return [];
    }
    
    const data = await res.json();
    console.log(`[Server] Successfully fetched ${Array.isArray(data) ? data.length : 0} products`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[Server] Error fetching products:", error);
    console.error("[Server] API Endpoint:", apiEndpoint);
    if (error instanceof Error) {
      console.error("[Server] Error message:", error.message);
      console.error("[Server] Error stack:", error.stack);
    }
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="bg-gradient-to-b from-zinc-50 to-white dark:from-black dark:to-zinc-900">
      {/* 히어로 섹션 */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            새로운 쇼핑 경험을 시작하세요
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            최고의 품질과 서비스로 여러분의 라이프스타일을 업그레이드하세요
          </p>
        </div>

        {/* 카테고리 배지 */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {["전체", "인기상품", "신상품", "특가"].map((category) => (
            <button
              key={category}
              className="px-6 py-2 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all font-medium"
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* 상품 목록 섹션 */}
      <section className="container mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            인기 상품
          </h2>
          <Link
            href="/products"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            전체 보기 →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-2">
              상품이 없습니다
            </p>
            <p className="text-sm text-zinc-500">
              곧 새로운 상품이 추가될 예정입니다
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group bg-white dark:bg-zinc-900 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* 상품 이미지 */}
                <div className="relative aspect-square bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 overflow-hidden">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-zinc-300 dark:text-zinc-700"
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
                  {/* 재고 배지 */}
                  {product.stockQuantity === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      품절
                    </div>
                  )}
                  {product.stockQuantity > 0 && product.stockQuantity < 10 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      재고부족
                    </div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">
                    {product.description || "설명 없음"}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        ₩{parsePrice(product.price).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      재고 {product.stockQuantity}개
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 추가 섹션 */}
      <section className="bg-zinc-100 dark:bg-zinc-900 py-16 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-50">
                무료 배송
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                5만원 이상 구매 시 무료 배송
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-50">
                안전한 결제
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                안전하고 빠른 결제 시스템
              </p>
            </div>
            <div className="text-center">
              <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                <svg
                  className="w-8 h-8 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-lg mb-2 text-zinc-900 dark:text-zinc-50">
                24/7 고객 지원
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                언제든지 문의하세요
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
