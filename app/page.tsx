import { Product } from './types';
import { getServerApiUrl, getFetchOptions } from './lib/api';
import ProductCard from './components/ProductCard';

async function getProducts(): Promise<Product[]> {
  const apiUrl = getServerApiUrl();
  const apiEndpoint = `${apiUrl}/products`;

  try {
    const res = await fetch(apiEndpoint, {
      next: { revalidate: 60 }, // ISR: 60초마다 재검증
      ...getFetchOptions(),
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
            <ProductCard key={product.id} product={product} />
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

