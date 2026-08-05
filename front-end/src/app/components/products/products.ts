import { Component } from '@angular/core';

interface Product {
  _id: string;
  name: string;
  brand: string;
  price: number;
  oldPrice?: number;
  image: string;
  unit: string;
  stock: number;
  isAvailable: boolean;
}

@Component({
  selector: 'app-products',
  imports: [],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  products: Product[] = [
    {
      _id: '6a6c9006a78df915c45f28ad',
      name: 'Wholegrain Rye Crispbread',
      brand: 'Ryvita',
      price: 4.29,
      image: 'assets/drinks.png',
      unit: 'ea',
      stock: 100,
      isAvailable: true,
    },
    {
      _id: '6a6c9006a78df915c45f28ae',
      name: 'Smooth Peanut Butter',
      brand: 'Kraft',
      price: 6.99,
      oldPrice: 8.49,
      image: 'assets/d&epng.png',
      unit: 'ea',
      stock: 50,
      isAvailable: true,
    },
    {
      _id: '6a6c9006a78df915c45f28af',
      name: 'Flavour Mix Variety Packs',
      brand: 'Frito-Lay',
      price: 5.49,
      image: 'assets/ff.jpeg',
      unit: 'ea',
      stock: 0,
      isAvailable: false,
    },
  ];

  wishlistIds = new Set<string>();

  addToCart(product: Product) {
    if (!product.isAvailable) return;
    console.log('Add to cart:', product.name);
  }

  toggleWishlist(product: Product) {
    if (this.wishlistIds.has(product._id)) {
      this.wishlistIds.delete(product._id);
    } else {
      this.wishlistIds.add(product._id);
    }
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistIds.has(productId);
  }
}