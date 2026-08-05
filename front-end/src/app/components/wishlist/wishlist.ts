import { Component } from '@angular/core';
import { WishlistService } from '../../service/wishlist';

@Component({
  selector: 'app-wishlist',
  imports: [],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  constructor(public wishlistService: WishlistService) {}

  removeFromWishlist(productId: string) {
    this.wishlistService.remove(productId);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/150?text=No+Image';
  }
}