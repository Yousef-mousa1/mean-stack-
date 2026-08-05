export interface Iproduct {
  _id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  unit: string;
  stock: number;
  isAvailable: boolean;
}

// شكل الرد اللي بيرجعلنا من GET /api/products
export interface IproductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Iproduct[];
}