import { environment } from '../../../environments/environment';
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../service/cart.service';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  packageSize?: string;
  isAvailable?: boolean;
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
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart = signal<CartData | null>(null);
  loading = signal(true);
  errorMessage = signal('');
  updatingProductId = signal<string | null>(null);

  // نفس الـ backend URL المستخدم في products.ts عشان الصور النسبية تتحول لرابط كامل
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

  constructor(private cartService: CartService, private router: Router) {}

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

  increaseQuantity(item: CartItem): void {
    this.changeQuantity(item, 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity <= 1) return;
    this.changeQuantity(item, -1);
  }

  private changeQuantity(item: CartItem, delta: number): void {
    this.updatingProductId.set(item.productId._id);
    this.cartService.addToCart(item.productId._id, delta).subscribe({
      next: (res) => {
        this.cart.set(res.cart);
        this.updatingProductId.set(null);
      },
      error: () => {
        this.errorMessage.set('حصلت مشكلة في تحديث الكمية');
        this.updatingProductId.set(null);
      }
    });
  }

  removeItem(productId: string): void {
    this.updatingProductId.set(productId);
    this.cartService.removeFromCart(productId).subscribe({
      next: (res) => {
        this.cart.set(res.cart);
        this.updatingProductId.set(null);
      },
      error: () => {
        this.errorMessage.set('حصلت مشكلة في حذف المنتج');
        this.updatingProductId.set(null);
      }
    });
  }

  proceedToCheckout(): void {
    this.router.navigate(['/checkout']);
  }

  // نفس منطق getImageUrl في products.ts - يحول الرابط النسبي لرابط كامل
  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://via.placeholder.com/150?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${this.backendUrl}${image}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}