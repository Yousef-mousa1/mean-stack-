import { Component, OnInit, signal } from '@angular/core';
import { ProductsService } from '../../service/products';
import { Iproduct } from '../../model/iproduct';
import { WishlistService } from '../../service/wishlist';

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products = signal<Iproduct[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  constructor(
    private productsService: ProductsService,
    public wishlistService: WishlistService
  ) {}

  ngOnInit() {
    this.fetchProducts();
  }

  fetchProducts() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productsService.getAll().subscribe({
      next: (result) => {
        if (result.success) {
          this.products.set(result.data);
        } else {
          this.errorMessage.set('حصلت مشكلة في جلب المنتجات');
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Fetch error:', err);
        this.errorMessage.set(
          'مقدرناش نوصل للسيرفر. تأكد إن الباك إند شغال على http://localhost:3000'
        );
        this.loading.set(false);
      },
    });
  }

  addToCart(product: Iproduct) {
    if (!product.isAvailable) return;
    console.log('Add to cart:', product.name);
  }

  toggleWishlist(product: Iproduct) {
    this.wishlistService.toggle(product);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}