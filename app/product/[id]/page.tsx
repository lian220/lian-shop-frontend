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

async function getProduct(id: string): Promise<Product | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  try {
    const res = await fetch(`${apiUrl}/api/products/${id}`, {
      cache: "no-store",
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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← 뒤로 가기
        </Link>
        
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="md:flex">
            <div className="md:w-1/2">
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-zinc-400">이미지 없음</span>
                )}
              </div>
            </div>
            <div className="md:w-1/2 p-8">
              <h1 className="text-3xl font-bold mb-4 text-black dark:text-zinc-50">
                {product.name}
              </h1>
              <p className="text-2xl font-bold mb-6 text-black dark:text-zinc-50">
                ₩{parsePrice(product.price).toLocaleString()}
              </p>
              <div className="mb-6">
                <h2 className="font-semibold mb-2 text-black dark:text-zinc-50">
                  상품 설명
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {product.description || "설명 없음"}
                </p>
              </div>
              <div className="mb-6">
                <p className="text-sm text-zinc-500">
                  재고: {product.stockQuantity}개
                </p>
              </div>
              <button
                className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity > 0 ? "장바구니에 추가" : "품절"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

