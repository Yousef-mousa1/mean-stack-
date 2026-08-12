import { Wishlist } from './../wishlist/wishlist';
import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WishlistService } from '../../service/wishlist';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  cartCount = 0;
  isMenuOpen = false;

  // بتتغيّر لـ true بعد ما اليوزر يعمل سكرول لتحت شوية، وبنستخدمها في الـ HTML
  // عشان نبدّل خلفية الهيدر من شفافة لبيضة
  isScrolled = signal(false);

  // شريط البحث بيظهر بس في الصفحة الرئيسية وصفحات المنتجات/الكاتيجوريز
  showSearch = signal(true);

  // بحقن الـ services المشتركة عشان نعرض عدد المنتجات في الويش ليست وحالة تسجيل الدخول
  constructor(
    public wishlistService: WishlistService,
    public auth: Auth,
    private router: Router
  ) {
    // قيمة أولية بناءً على الصفحة الحالية وقت ما الهيدر يتحمّل
    this.showSearch.set(this.isSearchVisible(this.router.url));

    // بعد كده بنتابع أي تنقّل بين الصفحات ونحدّث القيمة
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showSearch.set(this.isSearchVisible(event.urlAfterRedirects));
      });
  }

  private isSearchVisible(url: string): boolean {
    return url === '/' || url.startsWith('/products');
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }

  logout(): void {
    this.auth.logout();
  }
}