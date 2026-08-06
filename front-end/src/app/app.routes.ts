import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Wishlist } from './components/wishlist/wishlist';
import { Categories } from './components/categories/categories';
import { AdminCategories } from './components/admin-categories/admin-categories';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';

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
    path: 'admin/categories',
    component: AdminCategories
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
    path: 'cart',
    component: CartComponent
  },
  {
    path: 'checkout',
    component: CheckoutComponent
  },
  {
    path: 'my-orders',
    component: MyOrdersComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];