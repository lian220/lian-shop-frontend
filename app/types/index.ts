// 공통 타입 정의

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | string; // BigDecimal은 JSON에서 문자열로 변환될 수 있음
  stockQuantity: number;
  imageUrl: string | null;
}

export interface CreateProductRequest {
  name: string;
  description: string | null;
  price: number | string;
  stockQuantity: number;
  imageUrl: string | null;
}

