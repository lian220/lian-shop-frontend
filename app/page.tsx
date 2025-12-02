import { Product } from './types';
import { getServerApiUrl, getFetchOptions } from './lib/api';
import ProductCard from './components/ProductCard';
import { getOrganizationSchema, getWebsiteSchema, getItemListSchema } from './lib/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '리안샵 - 미니멀 라이프스타일 쇼핑몰',
  description: '리안(Lian)에서 프리미엄 상품을 만나보세요. 미니멀하고 세련된 디자인의 제품들을 최고의 가격으로 제공합니다.',
  keywords: ['리안', '리안샵', 'lian', 'lian shop', '온라인쇼핑', '미니멀샵', '프리미엄쇼핑몰'],
  openGraph: {
    title: '리안샵 - 미니멀 라이프스타일 쇼핑몰',
    description: '리안(Lian)에서 프리미엄 상품을 만나보세요',
  },
};

async function getProducts(): Promise<Product[]> {
  const apiUrl = getServerApiUrl();
  const apiEndpoint = `${apiUrl}/products`;

  try {
    const res = await fetch(apiEndpoint, {
      next: { revalidate: 60 }, // ISR: 60초마다 재검증
      ...getFetchOptions(),
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  // JSON-LD 구조화된 데이터 생성
  const organizationSchema = getOrganizationSchema();
  const websiteSchema = getWebsiteSchema();
  const itemListSchema = products.length > 0 ? getItemListSchema(
    products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
      image: p.imageUrl || '',
      brand: 'Lian Shop',
    }))
  ) : null;

  return (
    <>
      {/* JSON-LD 구조화된 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}

      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-6xl font-bold tracking-tighter mb-6 leading-tight">
              LIAN<br />MINIMAL<br />LIFESTYLE.
            </h1>
            <p className="text-lg text-zinc-500 max-w-md">
              리안(Lian)에서 프리미엄 상품을 만나보세요. 미니멀하고 세련된 디자인의 제품들을 큐레이션합니다.
            </p>
          </div>
        </section>

        {/* Product List */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold mb-8 tracking-tight">
            리안샵 추천 상품
          </h2>
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
    </>
  );
}

