import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../service/products';
import { CategoriesService } from '../../service/categories';
import { CartService } from '../../service/cart.service';
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

  // رابط الباك اند - غيّره لو الـ port مختلف أو وقت الـ deployment
  private readonly backendUrl = 'http://localhost:3000';

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    public wishlistService: WishlistService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const categoryName = params.get('category');
      this.loadProducts(categoryName);
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

    this.productsService.getAll(categoryId).subscribe({
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
        // بعد ما المنتج يتضاف بنجاح، وديه على صفحة السلة
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        console.error('Add to cart error:', err);
        // 401 معناها لسه مسجّلش دخول (الـ auth لسه مش متكامل)
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

  // بيحوّل مسار الصورة النسبي (/images/xxx.jpg) لرابط كامل على الباك اند.
  // لو الرابط جاهز كامل (http...) بيسيبه زي ما هو، ولو مفيش صورة بيرجّع placeholder.
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