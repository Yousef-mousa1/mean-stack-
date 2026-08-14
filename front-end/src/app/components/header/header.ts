import { Wishlist } from './../wishlist/wishlist';
import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { WishlistService } from '../../service/wishlist';
import { Auth } from '../../service/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  cartCount = 0;
  isMenuOpen = false;

  isScrolled = signal(false);
  showSearch = signal(true);
  isAdminSection = signal(false);

  // نص البحث المكتوب في الـ input
  searchTerm = signal('');

  constructor(
    public wishlistService: WishlistService,
    public auth: Auth,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.showSearch.set(this.isSearchVisible(this.router.url));
    this.isAdminSection.set(this.isAdminRoute(this.router.url));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.showSearch.set(this.isSearchVisible(event.urlAfterRedirects));
        this.isAdminSection.set(this.isAdminRoute(event.urlAfterRedirects));
      });
  }

  private isSearchVisible(url: string): boolean {
    return url === '/' || url.startsWith('/products');
  }

  private isAdminRoute(url: string): boolean {
    return url.startsWith('/admin');
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

  // بيتنفّذ لما اليوزر يدوس Enter في حقل السيرش (أو زرار البحث لو ضفناه)
  onSearch(): void {
    const term = this.searchTerm().trim();

    this.router.navigate(['/products'], {
      queryParams: { search: term || null },
      queryParamsHandling: 'merge',
    });

    // يقفل المنيو لو اليوزر كان على الموبايل
    this.isMenuOpen = false;
  }
}