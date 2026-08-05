import { Wishlist } from './../wishlist/wishlist';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../service/wishlist';
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

  // بحقن الـ service المشترك عشان نعرض عدد المنتجات في الويش ليست جنب الأيقونة
  constructor(public wishlistService: WishlistService) {}
  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }
}