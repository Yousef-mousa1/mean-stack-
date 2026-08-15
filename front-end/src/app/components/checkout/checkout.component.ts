import { environment } from '../../../environments/environment';
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../service/cart.service';
import { OrdersService } from '../../service/Orders.service';
import { CouponsService } from '../../service/coupons';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  packageSize?: string;
}

interface CartItem {
  productId: Product;
  quantity: number;
}

interface CartData {
  _id: string;
  userId: string;
  items: CartItem[];
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class Checkout implements OnInit {
  cart = signal<CartData | null>(null);
  loading = signal(true);
  submitting = signal(false);
  errorMessage = signal('');

  address = signal('');
  phone = signal('');

  // ===== Coupon state =====
  couponCode = signal('');
  applyingCoupon = signal(false);
  couponError = signal('');
  appliedCoupon = signal<{ code: string; discountAmount: number } | null>(null);

  private readonly backendUrl = environment.backendUrl;

  totalPrice = computed(() => {
    const c = this.cart();
    if (!c) return 0;
    return c.items.reduce((sum, item) => sum + item.productId.price * item.quantity, 0);
  });

  totalItems = computed(() => {
    const c = this.cart();
    if (!c) return 0;
    return c.items.reduce((sum, item) => sum + item.quantity, 0);
  });

  finalTotal = computed(() => {
    const applied = this.appliedCoupon();
    if (!applied) return this.totalPrice();
    return Math.max(0, this.totalPrice() - applied.discountAmount);
  });

  constructor(
    private cartService: CartService,
    private orderService: OrdersService,
    private couponsService: CouponsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.cartService.getCart().subscribe({
      next: (res) => {
        this.cart.set(res.cart);
        this.loading.set(false);
      },
      error: (err) => {
        if (err.status === 404) {
          this.cart.set(null);
        } else if (err.status === 401) {
          this.errorMessage.set('لازم تسجّل الدخول الأول');
        } else {
          this.errorMessage.set('حصلت مشكلة في تحميل الكارت');
        }
        this.loading.set(false);
      }
    });
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://via.placeholder.com/150?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${this.backendUrl}${image}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }

  // ===== Coupon logic =====

  applyCoupon(): void {
    const code = this.couponCode().trim();
    if (!code) {
      this.couponError.set('من فضلك أدخل كود الكوبون');
      return;
    }

    this.applyingCoupon.set(true);
    this.couponError.set('');

    this.couponsService.apply(code).subscribe({
      next: (res) => {
        this.appliedCoupon.set({
          code: res.couponCode,
          discountAmount: res.discountAmount,
        });
        this.applyingCoupon.set(false);
      },
      error: (err) => {
        this.appliedCoupon.set(null);
        this.couponError.set(err?.error?.message || 'الكوبون غير صالح');
        this.applyingCoupon.set(false);
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode.set('');
    this.couponError.set('');
  }

  submitOrder(): void {
    this.errorMessage.set('');

    if (!this.address().trim()) {
      this.errorMessage.set('من فضلك أدخل العنوان');
      return;
    }

    if (!this.phone().trim()) {
      this.errorMessage.set('من فضلك أدخل رقم التليفون');
      return;
    }

    const c = this.cart();
    if (!c || c.items.length === 0) {
      this.errorMessage.set('السلة فاضية');
      return;
    }

    this.submitting.set(true);

    const applied = this.appliedCoupon();

    this.orderService.createOrder(this.address().trim(), applied?.code).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.router.navigate(['/my-orders']);
      },
      error: (err) => {
        this.submitting.set(false);
        if (err.status === 400) {
          this.errorMessage.set(err?.error?.message || 'السلة فاضية أو حصلت مشكلة في الطلب');
        } else if (err.status === 401) {
          this.errorMessage.set('لازم تسجّل الدخول الأول');
        } else {
          this.errorMessage.set('حصلت مشكلة في تنفيذ الطلب');
        }
      }
    });
  }
}