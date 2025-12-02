import Link from "next/link";
import Image from "next/image";

interface Product {
  id: number;
  name: string;
  description: string | null;

  price: number | string;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
  const apiUrl = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
  const apiEndpoint = `${apiUrl}/products`;

  try {
    const res = await fetch(apiEndpoint, {
      next: { revalidate: 60 }, // ISR: 60초마다 재검증
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      console.error(`[Server] Failed to fetch products: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("[Server] Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-2xl">
          <h1 className="text-6xl font-bold tracking-tighter mb-6 leading-tight">
            MINIMAL<br />CONTEMPORARY<br />ESSENTIALS.
          </h1>
          <p className="text-lg text-zinc-500 max-w-md">
            Discover our curated collection of premium goods designed for modern life.
          </p>
        </div>
      </section>

      {/* Product List */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.id}`}
              className="group block"
            >
              <div className="relative aspect-[3/4] bg-zinc-100 dark:bg-zinc-900 mb-4 overflow-hidden">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    priority={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    NO IMAGE
                  </div>
                )}
                {product.stockQuantity === 0 && (
                  <div className="absolute top-2 right-2 bg-black text-white text-[10px] px-2 py-1 font-bold uppercase">
                    Sold Out
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold uppercase tracking-wide">
                  {product.name}
                </h3>
                <span className="text-sm text-zinc-500">
                  ₩{parsePrice(product.price).toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-32 text-zinc-400 text-sm uppercase tracking-widest">
            No products available
          </div>
        )}
      </section>
    </div>
  );
}

