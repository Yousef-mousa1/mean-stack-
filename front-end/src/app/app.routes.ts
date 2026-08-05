import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Wishlist } from './components/wishlist/wishlist';
export const routes: Routes = [
 {
    path: '',
    component: Home
  },
  {
    path: 'wishlist',
    component: Wishlist
  },
  {
    path: 'products',
    component: Products
  },
  {
    path: 'products/:category',
    component: Products
  },
  {
    path: '**',
    redirectTo: ''
  }
];