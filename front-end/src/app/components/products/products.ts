import { environment } from '../../../environments/environment';
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../service/products';
import { CategoriesService } from '../../service/categories';
import { CartService } from '../../service/cart.service';
import { Iproduct } from '../../model/iproduct';
import { WishlistService } from '../../service/wishlist';
import { ToastService } from '../../service/toast';

@Component({
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  products = signal<Iproduct[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  private readonly backendUrl = environment.backendUrl;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    public wishlistService: WishlistService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {}
  searchTerm: string | null = null;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const categoryName = params.get('category');
      this.route.queryParamMap.subscribe((queryParams) => {
        this.searchTerm = queryParams.get('search');
        this.loadProducts(categoryName);
      });
    });
  }

  private loadProducts(categoryName: string | null) {
    if (!categoryName) {
      this.fetchProducts();
      return;
    }

    this.loading.set(true);
    this.categoriesService.getAll().subscribe({
      next: (result) => {
        if (!result.success) {
          this.fetchProducts();
          return;
        }
        const normalize = (str: string) =>
          str.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = result.data.find(
          (cat) => normalize(cat.name) === normalize(categoryName)
        );
        this.fetchProducts(match?._id);
      },
      error: () => {
        this.fetchProducts();
      },
    });
  }

  fetchProducts(categoryId?: string) {
    this.loading.set(true);
    this.errorMessage.set('');

    this.productsService.getAll({
      category: categoryId,
      search: this.searchTerm || undefined,
    }).subscribe({
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

    this.cartService.addToCart(product._id, 1).subscribe({
      next: () => {
        this.toastService.show(`تم إضافة ${product.name} للسلة`);
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        if (err.status === 401) {
          this.errorMessage.set('لازم تسجّل الدخول الأول عشان تضيف للسلة');
        } else {
          this.errorMessage.set('حصلت مشكلة في إضافة المنتج للسلة');
        }
      },
    });
  }

  toggleWishlist(product: Iproduct) {
    this.wishlistService.toggle(product);
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistService.isInWishlist(productId);
  }

  getImageUrl(image: string | undefined | null): string {
    if (!image) return 'https://via.placeholder.com/150?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${this.backendUrl}${image}`;
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}