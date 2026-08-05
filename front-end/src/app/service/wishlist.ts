import { Injectable, signal } from '@angular/core';
import { Iproduct } from '../model/iproduct';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private items = signal<Iproduct[]>([]);

  readonly wishlist = this.items.asReadonly();

  isInWishlist(productId: string): boolean {
    return this.items().some((p) => p._id === productId);
  }

  add(product: Iproduct) {
    if (this.isInWishlist(product._id)) return;
    this.items.update((list) => [...list, product]);
  }

  remove(productId: string) {
    this.items.update((list) => list.filter((p) => p._id !== productId));
  }

  toggle(product: Iproduct) {
    if (this.isInWishlist(product._id)) {
      this.remove(product._id);
    } else {
      this.add(product);
    }
  }
}