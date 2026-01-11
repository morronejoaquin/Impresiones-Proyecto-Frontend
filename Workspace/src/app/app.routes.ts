import { Routes } from '@angular/router';
import { HomePage } from './pages/AboutUs/home-page/home-page';
import { MakeOrderPage } from './pages/Orders/make-order-page/make-order-page';
import { PriceCalculatorPage } from './pages/AboutUs/price-calculator-page/price-calculator-page';
import { WherePage } from './pages/AboutUs/where-page/where-page';
import { ShowCartPage } from './pages/Cart/show-cart-page/show-cart-page';
import { UserLoginPage } from './pages/Users/user-login-page/user-login-page';
import { UserRegisterPage } from './pages/Users/user-register-page/user-register-page';
import { AccountPage } from './pages/Users/account-page/account-page';
import { UserEditPage } from './pages/Users/user-edit-page/user-edit-page';
import { permissionGuard } from './guards/permission-guard';
import { CartPaymentPage } from './pages/Cart/cart-payment-page/cart-payment-page';
import { AdminRecordPage } from './pages/Admin/admin-record-page/admin-record-page';

export const routes: Routes = [
  { path: '', redirectTo: 'user-login', pathMatch: 'full' },
  { path: 'user-login', component: UserLoginPage },
  { path: 'user-register', component: UserRegisterPage },

  {
    path: 'home',
    component: HomePage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['guest', 'registered', 'admin'] }
  },
  {
    path: 'account',
    component: AccountPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['registered', 'admin'] }
  },
  {
    path: 'user-edit',
    component: UserEditPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['registered', 'admin'] }
  },

  {
    path: 'make-order',
    component: MakeOrderPage,
  },
  {
    path: 'make-order/:orderId',
    component: MakeOrderPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['guest', 'registered', 'admin'] }
  },
  {
    path: 'cart',
    component: ShowCartPage,
  },
  {
    path: 'cart-payment',
    component: CartPaymentPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['guest', 'registered', 'admin'] }
  },
  {
    path: 'price-calculator',
    component: PriceCalculatorPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['guest', 'registered', 'admin'] }
  },
  {
    path: 'contact',
    component: WherePage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['guest', 'registered', 'admin'] }
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/Admin/admin-page/admin-page').then(m => m.AdminPage),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['admin'] }
  }, {
    path: 'admin/order/:id',
    loadComponent: () =>
      import('./pages/Admin/admin-order-detail/admin-order-detail').then(m => m.AdminOrderDetailPage),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['admin'] }
  },{
    path: 'admin/prices',
    loadComponent: () =>
      import('./pages/Admin/price-admin/price-admin').then(m => m.PriceAdminComponent),
    canActivate: [permissionGuard],
    data: { allowedRoles: ['admin'] }
  },
  {
    path: 'admin/record',
    component: AdminRecordPage,
    canActivate: [permissionGuard],
    data: { allowedRoles: ['admin']}
  },
  { path: '**', redirectTo: 'user-login' }
];
