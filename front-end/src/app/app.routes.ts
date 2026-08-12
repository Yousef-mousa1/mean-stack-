import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Wishlist } from './components/wishlist/wishlist';
import { Categories } from './components/categories/categories';
import { AdminCategories } from './components/admin-categories/admin-categories';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { MyOrdersComponent } from './components/my-orders/my-orders.component';
import { ApplyCoupon } from './components/apply-coupon/apply-coupon';
import { Login } from './components/login/login';
import { Register } from './components/rigister/rigister';
import { VerifyOtp } from './components/verify-otp/verify-otp';
import { Dashboard } from './components/dashboard/dashboard';
import { islogginGuard } from './guards/isloggin-guard-guard';
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
 {
    path: '',
   component: Home
  },
  {
    path: 'coupon',
    component: ApplyCoupon,
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
    path: 'login',
    component: Login,
  },

  {
    path: 'register',
    component: Register,
  },
  {
    path: 'verify-otp/:userId',
    component: VerifyOtp,
  },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [islogginGuard],
  },
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    canActivate: [islogginGuard],
  },







  {
    path: '**',
    redirectTo: ''
  }
];