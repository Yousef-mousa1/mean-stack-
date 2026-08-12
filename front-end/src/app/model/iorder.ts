export interface IOrderProduct {
  _id: string;
  name: string;
  image?: string;
  brand?: string;
}

export interface IOrderItem {
  productId: IOrderProduct;
  quantity: number;
  price: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Delivered' | 'Cancelled';

export interface Iorder {
  _id: string;
  userId: string;
  items: IOrderItem[];
  totalPrice: number;
  Address: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}