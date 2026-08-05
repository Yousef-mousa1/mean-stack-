import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
export const routes: Routes = [
  {
    path: '',
    component: Home
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