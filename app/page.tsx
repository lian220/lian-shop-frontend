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
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  
  try {
    const res = await fetch(`${apiUrl}/api/products`, {
      cache: "no-store",
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch products: ${res.status} ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching products:", error);
    // 개발 환경에서만 상세 에러 표시
    if (process.env.NODE_ENV === 'development') {
      console.error("API URL:", apiUrl);
      console.error("Error details:", error);
    }
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-black dark:text-zinc-50">
          Lian Shop
        </h1>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">
              상품이 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
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
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 text-black dark:text-zinc-50">
                    {product.name}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-2 line-clamp-2">
                    {product.description || "설명 없음"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-black dark:text-zinc-50">
                      ₩{parsePrice(product.price).toLocaleString()}
                    </span>
                    <span className="text-sm text-zinc-500">
                      재고: {product.stockQuantity}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
