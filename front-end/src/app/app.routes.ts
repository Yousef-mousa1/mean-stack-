import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Wishlist } from './components/wishlist/wishlist';
import { Categories } from './components/categories/categories';

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
    path: 'categories',
    component: Categories
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