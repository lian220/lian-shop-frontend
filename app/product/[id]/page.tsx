import ProductDetailLoader from './ProductDetailLoader';

export default function ProductPage() {
  // 클라이언트 사이드에서 상품 정보를 로드하도록 변경
  return <ProductDetailLoader initialProduct={null} />;
}

