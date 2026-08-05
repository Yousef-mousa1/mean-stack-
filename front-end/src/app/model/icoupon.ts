export interface Icoupon {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minCartValue: number;
  expiryDate: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt?: string;
}

export interface IcouponsResponse {
  coupons: Icoupon[];
}

export interface IapplyCouponResponse {
  message: string;
  cartTotal: number;
  discountAmount: number;
  finalTotal: number;
  couponCode: string;
}